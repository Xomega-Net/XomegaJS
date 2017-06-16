// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // The base class for all data objects, which contain a list of data properties
    // and possibly a number of child objects or object lists.
    export class DataObject implements IDataObject {

        // Gets or sets the parent object for the current data object.
        Parent: KnockoutObservable<DataObject> = ko.observable<DataObject>();

        // the name of the child object within its parent object
        // use a name that is unlikely to clash with common properties called Name
        NameInParent: string;

        // Returns the current access level for the data object.
        // Allows setting a new access level for editability and visibility of all properties,
        // since both of it depend on the security access level.
        public AccessLevel: KnockoutObservable<AccessLevel> = ko.observable<AccessLevel>(AccessLevel.Full);

        private editable: KnockoutObservable<boolean> = ko.observable<boolean>(true);

        public Editable: KnockoutObservable<boolean>;

        private modified: KnockoutObservable<boolean> = ko.observable<boolean>();

        // Gets or sets the modification state of the object.
        public Modified: KnockoutObservable<boolean>;

        /** A flag indicating if the object is tracking modifications */
        public TrackModifications: boolean = true;

        constructor() {

            // initialize Editable before properties, since it is used in turn by the properties
            this.Editable = ko.computed({
                read: () => {
                    var al: number = this.AccessLevel();
                    return this.editable()
                        && (this.Parent() == null || this.Parent().Editable())
                        && (al > AccessLevel.ReadOnly);
                },
                write: (value: boolean) => { this.editable(value); },
                owner: this
            });

            // initialize the properties
            this.init();

            // set up name/parent and any additional initialization on all properties and child objects
            this.onInitialized();

            // initialize Modified after the properties and child objects, since it uses them
            this.Modified = ko.computed<boolean>({
                read: () => {
                    if (!this.TrackModifications) return false;
                    var res = this.modified();
                    for (var prop in this) {
                        var p: any = this[prop];
                        if ((<Object>this).hasOwnProperty(prop) && p && p.Modified ) {
                            if (p.Modified() != null) res = res || p.Modified();
                        }
                    }
                    return res;
                },
                write: (value: boolean) => {
                    this.modified(value);
                    if (value === false || value == null) {
                        for (var prop in this) {
                            var p: any = this[prop];
                            if ((<Object>this).hasOwnProperty(prop) && p && p.Modified)
                                p.Modified(value);
                        }
                    }
                },
                owner: this
            });

            // reset the Modified flag in case it changed during initialization
            this.Modified(null);
        }

        // The abstract method to be implemented by the subclasses
        // to add and initialize data object properties and child objects.
        init(): void { }

        // Additional initialization that happens after all the properties
        // and child objects have been added and are therefore accessible.
        onInitialized(): void {
            for (var prop in this) {
                let p: any = this[prop];
                if ((<Object>this).hasOwnProperty(prop) && p && p.onInitialized) {
                    var init: IInitializable = <IInitializable>p;
                    init.setName(prop);
                    init.Parent(this);
                    init.onInitialized();
                }
            }
        }

        // implemntation of the IInitializable
        public setName(name: string) {
            this.NameInParent = name;
        }

        // resets the data object to default values
        public reset(): void {
            for (var prop in this) {
                let dp: any = this[prop];
                if (this.hasOwnProperty(prop) && dp && dp.reset) dp.reset();
            }
            this.ValidationErrors.Errors.removeAll();
        }

        // gets current object's data property by name
        protected getDataProperty(name: string): DataProperty {
            let names = [name + 'Property', name];
            for (let nm of names) {
                let dp: DataProperty = this[nm];
                if (dp instanceof DataProperty) return dp;
            }
            return null;
        }

        // gets current object's child object by name
        protected getChildObject(name: string): DataObject {
            let names = [name + 'Object', name + 'List', name];
            for (let nm of names) {
                let dobj: DataObject = this[nm];
                if (dobj instanceof DataObject) return dobj;
            }
            return null;
        }

        // initializes data object's data from the specified JSON object
        public fromJSON(obj, options?) {
            for (let prop in obj) {
                if (!(<Object>obj).hasOwnProperty(prop)) continue;
                let dp = this.getDataProperty(prop);
                if (dp) {
                    dp.setValue(obj[prop], ValueFormat.Transport);
                    dp.Modified(false);
                } else {
                    let dobj = this.getChildObject(prop);
                    if (dobj) dobj.fromJSON(obj[prop]);
                }
            }
        }

        // typed function to convert data object values to the specified structure
        public toStruct<T>(c: { new (): T; }, options?): T {
            let struct: T = new c();
            return this.toJSON(struct, options);
        }

        // convert data object's data to a JSON object using the provided contract if any
        public toJSON(contract?: any, options?): any {
            let res = {};
            let ignoreEmpty: boolean = !options || options.ignoreEmpty; // true by default
            for (let prop in this) {
                if (!this.hasOwnProperty(prop)) continue;
                let p: any = this[prop];
                if (p instanceof DataProperty && (!contract || contract.hasOwnProperty(prop))) {
                    res[p.Name] = p.TransportValue();
                    // ignore empty values to minimize JSON or the URL string when using $.param() on it
                    if (ignoreEmpty && !res[p.Name]) delete res[p.Name];
                } else if (p instanceof DataObject) {
                    let child = prop.replace(/(Object|List)$/, '');
                    if (!contract || contract.hasOwnProperty(child))
                        res[child] = p.toJSON();
                }
            }
            return res;
        }

        public get Properties(): Array<BaseProperty> {
            let res: Array<BaseProperty> = new Array<BaseProperty>();
            for (let prop in this) {
                if ((<Object>this).hasOwnProperty(prop) && this[prop] instanceof BaseProperty) {
                    let bp: any = this[prop];
                    res.push(bp as BaseProperty);
                }
            }
            return res;
        }

        isPropertyEditable(prop: BaseProperty): boolean {
            return this.Editable() && (this.Parent() == null || this.Parent().isPropertyEditable(prop));
        }

        isPropertyVisible(prop: BaseProperty): boolean {
            return this.Parent() == null || this.Parent().isPropertyVisible(prop);
        }

        isPropertyRequired(prop: BaseProperty): boolean {
            return this.Parent() == null || this.Parent().isPropertyRequired(prop);
        }

        // The list of validation errors for the data object.
        public ValidationErrors: ErrorList = new ErrorList();

        // Validation status of the data object
        public Validated: boolean = false;

        // Validate the data object. If force flag is true, then always validate,
        // otherwise (by default) validate only if needed.
        public validate(force: boolean = false) {
            if (force) this.Validated = false;
            if (this.Validated) return;

            this.ValidationErrors.Errors.removeAll();
            for (var prop in this) {
                let p: any = this[prop];
                if ((<Object>this).hasOwnProperty(prop) && p && p.validate) {
                    var pv: IValidatable = <IValidatable>p;
                    pv.validate(force);
                    this.ValidationErrors.mergeWith(pv.ValidationErrors);
                }
            }
            this.validateSelf();
            this.Validated = true;
        }

        // Validate the object itself, e.g. cross-field validations. etc.
        public validateSelf() {
            // to be overridden in subclasses
        }

        // Reads object data asynchronously
        public readAsync(options?): JQueryPromise<boolean> {
            let obj = this;
            return this.doReadAsync(options).then(() => {
                obj.IsNew(false);
                return true;
            });
        }

        // Actual implementation of reading object data provided by subclasses
        protected doReadAsync(options?): JQueryPromise<any> { return $.when(); }

        // Saves object data asynchronously
        public saveAsync(options?): JQueryPromise<any> {
            let obj = this;
            obj.validate(true);
            if (obj.ValidationErrors.hasErrors())
                return $.Deferred().reject(obj.ValidationErrors);
            return this.doSaveAsync(options).then(() => {
                obj.IsNew(false);
                obj.Modified(false);
            });
        }

        // Actual implementation of saving object data provided by subclasses
        protected doSaveAsync(options?): JQueryPromise<any> { return $.when(); }

        // Deletes object asynchronously
        public deleteAsync(options?): JQueryPromise<any> { return this.doDeleteAsync(options); }

        // Actual implementation of deleting the object provided by subclasses
        protected doDeleteAsync(options?): JQueryPromise<any> { return $.when(); }

        // An indicator if the object is new and not yet saved
        public IsNew: KnockoutObservable<boolean> = ko.observable<boolean>(true);


        // a list of callbacks to invoke when the object is ready
        private readyCallbacks: Array<() => void> = [];

        // register an callback to be invoked when the object is ready
        public onReady(callback: () => void) {
            if (this.isReady()) callback();
            else if (this.readyCallbacks.indexOf(callback) < 0)
                this.readyCallbacks.push(callback);
        }

        // returns if the object, including all properties and child objects, is ready
        public isReady(): boolean {
            for (var prop in this) {
                let p: any = this[prop];
                if ((<Object>this).hasOwnProperty(prop) && p && p.isReady) {
                    if (!p.isReady()) return false;
                }
            }
            return true;
        }

        // checks if the object is ready and, if so, invokes the regiestred onReady callbacks
        public checkIfReady() {
            if (this.Parent() != null) this.Parent().checkIfReady();
            else if (this.isReady()) {
                this.readyCallbacks.forEach((cb) => cb());
                this.readyCallbacks.length = 0;
            }
        }
    }
}