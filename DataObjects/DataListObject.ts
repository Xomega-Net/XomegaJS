// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // A class that holds data for each row of the data list object
    export class DataRow {

        // The parent data list object for this data row.
        public List: DataListObject;

        // constructs a new data row object
        constructor(list: DataListObject) {
            this.List = list;
        }

        // initializes data row's data from the specified JSON object
        public fromJSON(obj) {
            for (var prop in obj) {
                var dp = this.List[prop];
                if ((<Object>obj).hasOwnProperty(prop) && dp instanceof DataProperty) {
                    this[prop] = dp.resolveValue(obj[prop], ValueFormat.Internal);
                }
            }
        }

        // convert data row to a JSON object
        public toJSON(contract?: any): any {
            var res = {};
            for (var prop in this.List) {
                var dp = this.List[prop];
                if (this.hasOwnProperty(prop) && dp instanceof DataProperty && (!contract || contract.hasOwnProperty(prop))) {
                    res[prop] = dp.resolveValue(this[prop], ValueFormat.Transport);
                }
            }
            return res;
        }
    }

    // A dynamic data object that has a list of rows as its data instead of specific values.
    export class DataListObject extends DataObject {

        // the list of data objects for the current data object list
        public List: KnockoutObservableArray<DataRow> = ko.observableArray<DataRow>();

        // criteria object
        public CriteriaObject: DataObject = null;
        // applied criteria
        public AppliedCriteria: KnockoutObservableArray<FieldCriteria> = ko.observableArray<FieldCriteria>();

        // constructs a new data object list
        constructor() {
            super();
        }

        // resets the list
        public reset(): void {
            this.List.removeAll();
            this.AppliedCriteria(null);
            this.Modified(null);
        }

        // override validate to not call it on properties
        public validate(force: boolean): void {
            if (force) this.Validated = false;
            if (this.Validated) return;
            this.validateSelf();
            this.Validated = true;
        }

        // initializes data object list's data from the specified JSON object
        public fromJSON(obj) {
            if (!$.isArray(obj)) return;

            this.List.removeAll();
            var objects: Array<DataRow> = new Array<DataRow>();
            for (var i = 0; i < obj.length; i++) {
                var dr: DataRow = new DataRow(this);
                dr.fromJSON(obj[i]);
                objects.push(dr);
            }
            this.List(objects);
            this.AppliedCriteria(this.CriteriaObject ? this.CriteriaObject.getFieldsCriteria() : []);
            this.Modified(false);
        }

        // convert data object's data to a JSON object
        public toJSON(contract?: any): any {
            var res = [];
            var data: DataRow[] = this.List();
            var itemContract;
            if (contract instanceof Array && (<Array<any>>contract).length > 0)
                itemContract = (<Array<any>>contract)[0];
            for (var i = 0; i < data.length; i++) {
                res.push(data[i].toJSON(itemContract));
            }
            return res;
        }
    }
}