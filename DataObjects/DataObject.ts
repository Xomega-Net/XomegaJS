// Copyright (c) 2014 Xomega.Net. All rights reserved.

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
                    var res = this.modified();
                    for (var prop in this) {
                        if ((<Object>this).hasOwnProperty(prop) && this[prop] && this[prop].Modified) {
                            var p: IModifiable = <IModifiable>this[prop];
                            if (p.Modified() != null) res = res || p.Modified();
                        }
                    }
                    return res;
                },
                write: (value: boolean) => {
                    this.modified(value);
                    if (value === false || value == null) {
                        for (var prop in this) {
                            if ((<Object>this).hasOwnProperty(prop) && this[prop] && this[prop].Modified) {
                                var p: IModifiable = <IModifiable>this[prop];
                                p.Modified(value);
                            }
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
                if ((<Object>this).hasOwnProperty(prop) && this[prop] && this[prop].onInitialized) {
                    var p: IInitializable = <IInitializable>this[prop];
                    p.setName(prop);
                    p.Parent(this);
                    p.onInitialized();
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
                var dp = this[prop];
                if (this.hasOwnProperty(prop) && dp && dp.reset) dp.reset();
            }
            this.ValidationErrors.Errors.removeAll();
        }

        // initializes data object's data from the specified JSON object
        public fromJSON(obj) {
            for (var prop in obj) {
                var dp = this[prop];
                if ((<Object>obj).hasOwnProperty(prop) && dp) {
                    if (dp instanceof DataProperty) {
                        dp.setValue(obj[prop], ValueFormat.Transport);
                        dp.Modified(false);
                    }
                    else if (dp instanceof DataObject) dp.fromJSON(obj[prop]);
                }
            }
        }

        // convert data object's data to a JSON object using the provided contract if any
        public toJSON(contract?: any): any {
            var res = {};
            for (var prop in this) {
                if (this.hasOwnProperty(prop) && (!contract || contract.hasOwnProperty(prop))) {
                    if (this[prop] instanceof DataProperty)
                        res[prop] = this[prop].TransportValue();
                    else if (this[prop] instanceof DataObject) res[prop] = this[prop].toJSON();
                }
            }
            return res;
        }

        // substitutes url placeholders with matching property values
        public formatUrl(url: string): string {
            var self = this;
            return url.replace(/\{(.*?)\}/, function (param: string, p1: string): string {
                var prop = toCamelCase(p1);
                return (self.hasOwnProperty(prop) && self[prop] instanceof DataProperty) ? self[prop].TransportValue() : param;
            });
        }

        // convert data object's data to URL parameters string with a leading &
        public toUrlParams(): string {
            var url: string = "";
            for (var prop in this) {
                if (this.hasOwnProperty(prop)) {
                    if (this[prop] instanceof DataProperty) {
                        var val = this[prop].TransportValue();
                        if ($.isArray(val)) for (var i = 0; i < val.length; i++)
                            url += "&" + prop + "=" + val[i];
                        else if (val) url += "&" + prop + "=" + val;
                    }
                    else if (this[prop] instanceof DataObject) url += this[prop].toUrlParams();
                }
            }
            return url;
        }

        // triggers a callback for each property found in the query passing in the value from it
        public processQueryDict(query: any, callback: (p: DataProperty, value: any) => void) {
            if (query && callback) {
                for (var key in query) {
                    var prop: DataProperty = <DataProperty>this[key];
                    if (prop)
                        callback(prop, query[key]);
                }
            }
        }

        // fills properties with values from a query
        public fromQueryDict(query: any) {
            this.processQueryDict(query, (p: DataProperty, value: any) => {
                p.InternalValue(value);
            });
        }

        public get Properties(): Array<BaseProperty> {
            var res: Array<BaseProperty> = new Array<BaseProperty>();
            for (var prop in this) {
                if ((<Object>this).hasOwnProperty(prop) && this[prop] instanceof BaseProperty)
                    res.push(this[prop]);
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
                if ((<Object>this).hasOwnProperty(prop) && this[prop] && this[prop].validate) {
                    var p: IValidatable = <IValidatable>this[prop];
                    p.validate(force);
                    this.ValidationErrors.mergeWith(p.ValidationErrors);
                }
            }
            this.validateSelf();
            this.Validated = true;
        }

        // Validate the object itself, e.g. cross-field validations. etc.
        public validateSelf() {
            // to be overridden in subclasses
        }

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
                if ((<Object>this).hasOwnProperty(prop) && this[prop] && this[prop].isReady) {
                    if (!this[prop].isReady()) return false;
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

        // gets an array of field criteria
        public getFieldsCriteria(): Array<FieldCriteria> {
            // make a map of object's properties
            var map = {};
            for (var prop in this) {
                var p: any = this[prop];
                if ((<Object>this).hasOwnProperty(prop) && p instanceof BaseProperty)
                    map[(<BaseProperty>p).Name] = p;
            }
            // process operators if any
            for (var prop in map) {
                var p: any = map[prop];
                if (!(p instanceof OperatorProperty)) continue;
                var op: OperatorProperty = <OperatorProperty>p;
                // clear mapping for bound properties
                if (op.AdditionalPropertyName)
                    map[op.AdditionalPropertyName] = null;
                if (op.AdditionalPropertyName2)
                    map[op.AdditionalPropertyName2] = null;
            }
            // make array of settings
            var res: Array<FieldCriteria> = new Array<FieldCriteria>();
            for (var prop in map) {
                var p: any = map[prop];
                if (p instanceof OperatorProperty) {
                    var op: OperatorProperty = <OperatorProperty>p;
                    if (op.isNull()) continue;
                    var data: Array<string> = new Array<string>();
                    var dp1: DataProperty = op.AdditionalPropertyName ? <DataProperty>this[op.AdditionalPropertyName] : null;
                    if (dp1 && !dp1.isNull() && dp1.Visible()) data.push(dp1.DisplayStringValue());
                    var dp2: DataProperty = op.AdditionalPropertyName2 ? <DataProperty>this[op.AdditionalPropertyName2] : null;
                    if (dp2 && !dp2.isNull() && dp2.Visible()) data.push(dp2.DisplayStringValue());
                    res.push(new FieldCriteria(op.toString(), op.DisplayStringValue(), data));
                }
                else if (p instanceof DataProperty) {
                    var dp: DataProperty = <DataProperty>p;
                    if (dp.isNull()) continue;
                    res.push(new FieldCriteria(dp.toString(), null, [dp.DisplayStringValue()]));
                }
            }
            return res;
        }
    }
}