// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // A class that holds data for each row of the data list object
    export class DataRow {

        // The parent data list object for this data row.
        public List: DataListObject;

        public _selected: KnockoutObservable<boolean> = ko.observable(false);

        // Handle user click to toggle selection of the current row if the list supports selection
        public toggleSelection() {
            if (this.List.RowSelectionMode())
                this.List.toggleSelection(this);
        }

        // constructs a new data row object
        constructor(list: DataListObject) {
            this.List = list;
        }

        // initializes data row's data from the specified JSON object
        public fromJSON(obj) {
            for (var prop in obj) {
                var dp = this.List[prop];
                if ((<Object>obj).hasOwnProperty(prop) && dp instanceof DataProperty) {
                    this[prop] = dp.resolveValue(obj[prop], ValueFormat.Internal, ValueFormat.Transport);
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

        // Compares this row with the other row provided using specified sort criteria.
        public compareTo(other: DataRow, criteria: Array<ListSortField> = this.List ? this.List.SortCriteria() : null): number
        {
            if (!criteria || this.List !== other.List) return 0;
            else if (!other) return 1;

            let res = 0;
            for (let i = 0; i < criteria.length; i++) {
                let p: DataProperty = this.List[criteria[i].PropertyName];
                let nulls = criteria[i].NullsFirst ? -1 : 1;
                if (p != null) {
                    let val1 = this[criteria[i].PropertyName];
                    let val2 = other[criteria[i].PropertyName];
                    if (val1 == val2) res = 0;
                    else if (val1 == null && val2 != null) res = -1 * nulls;
                    else if (val1 != null && val2 == null) res = 1 * nulls;
                    else if (typeof val1 == 'number' && typeof val2 == 'number') res = val1 - val2;
                    else if (val1 instanceof Date && val2 instanceof Date) res = val1.getTime() - val2.getTime();
                    else if (val1.localeCompare) res = val1.localeCompare(val2); // string
                    else if (val2.localeCompare) res = -val2.localeCompare(val1); // string
                    else {
                        let str1: string = p.resolveValue(val1, ValueFormat.DisplayString);
                        let str2: string = p.resolveValue(val2, ValueFormat.DisplayString);
                        res = str1.localeCompare(str2);
                    }
                    if (criteria[i].SortDirection == ListSortDirection.Descending) res *= -1;
                }
                if (res != 0) return res;
            }
            return res;
        }
    }
}