// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // The base class for all data objects, which contain a list of data properties
    // and possibly a number of child objects or object lists.
    export class DataObjectList<T extends DataObject> extends DataObject implements IDataObjectList {

        // a function for creating individual data objects
        private objectCreator: () => T;

        public Template: T;

        // the list of data objects for the current data object list
        public List: KnockoutObservableArray<T> = ko.observableArray<T>();

        private listModified: KnockoutObservable<boolean> = ko.observable<boolean>();

        // constructs a new data object list with a function for creating individual data objects
        constructor(objectCreator: () => T) {
            super();
            this.objectCreator = objectCreator;
            this.Template = objectCreator();

            // delegate parent management to the template
            this.Parent = ko.computed({
                read: () => { return this.Template.Parent(); },
                write: (value: DataObject) => { this.Template.Parent(value); },
                owner: this
            });

            // delegate editable management to the template
            this.Editable = ko.computed({
                read: () => { return this.Template.Editable(); },
                write: (value: boolean) => { this.Template.Editable(value); },
                owner: this
            });

            // override the Modified to check the list of objects rather than properties
            this.Modified = ko.computed<boolean>({
                read: () => {
                    var obj: T, res = this.listModified();
                    for (var i = 0; i < this.List().length; i++) {
                        obj = this.List()[i];
                        if (obj.Modified() != null) res = res || obj.Modified();
                    }
                    return res;
                },
                write: (value: boolean) => { this.listModified(value); },
                owner: this
            });

            this.List.subscribe((changes) => {
                var modified: boolean = false;
                var obj: T;
                for (var i = 0; i < changes.length; i++) {
                    var change: any = changes[i];
                    obj = change.value;
                    if (change.status == "added") {
                        obj.Parent(this);
                        // if new items are added that have not been read, mark the list as modified
                        if (obj.Modified() == null) modified = true;
                    }
                    if (change.status == "deleted") {
                        obj.Parent(null);
                        // if items were removed, mark the list as modified
                        modified = true;
                    }
                }
                if (modified) this.Modified(true); // update observable once here
            }, this, "arrayChange");
        }

        // Override onInitialized to prevent updating the template
        onInitialized() {
            // do nothing, as base function would set this as a parent for the template
        }

        // resets the list
        public reset(): void {
            this.List.removeAll();
        }

        // initializes data object list's data from the specified JSON object
        public fromJSON(obj) {
            if (!$.isArray(obj)) return;

            this.List.removeAll();
            var objects: Array<T> = new Array<T>();
            for (var i = 0; i < obj.length; i++) {
                var dobj: T = this.objectCreator();
                dobj.fromJSON(obj[i]);
                objects.push(dobj);
            }
            this.List(objects);
        }

        // Delegates determining property editability to the template object.
        isPropertyEditable(prop: BaseProperty): boolean {
            var p: DataProperty = this.Template[prop.Name];
            return p == null || p.Editable();
        }

        // Delegates determining property visibility to the template object.
        isPropertyVisible(prop: BaseProperty): boolean {
            var p: DataProperty = this.Template[prop.Name];
            return p == null || p.Visible();
        }

        // Delegates determining if property is required to the template object.
        isPropertyRequired(prop: BaseProperty): boolean {
            var p: DataProperty = this.Template[prop.Name];
            return p == null || p.Required();
        }

        // Validates the data object list and all its contained objects recursively.
        public validate(force: boolean = false) {
            if (force) this.Validated = false;
            if (this.Validated) return;

            this.ValidationErrors.Errors.removeAll();
            var obj: T;
            for (var i = 0; i < this.List().length; i++) {
                obj = this.List()[i];
                obj.validate(force);
                this.ValidationErrors.mergeWith(obj.ValidationErrors);
            }
            this.validateSelf();
            this.Validated = true;
        }
    }
}