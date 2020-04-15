// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A dynamic data object that has a list of rows as its data instead of specific values.
    export class DataListObject extends DataObject {

        // the list of data objects for the current data object list
        public List: KnockoutObservableArray<DataRow> = ko.observableArray<DataRow>();

        public SortCriteria: KnockoutObservableArray<ListSortField> = ko.observableArray<ListSortField>();

        // criteria object
        public CriteriaObject: CriteriaObject = null;

        // applied criteria
        public AppliedCriteria: KnockoutObservableArray<FieldCriteria> = ko.observableArray<FieldCriteria>();

        public AppliedCriteriaText: KnockoutObservable<string> = ko.pureComputed(function () {
            let text: string = '';
            let crit = this.AppliedCriteria();
            if (!crit) return text;
            for (let i = 0; i < crit.length; i++) {
                let fc: FieldCriteria = crit[i];
                if (text) text += '; ';
                text += fc.Label + ':' + (fc.Operator ? ' ' + fc.Operator : '') + (fc.Data.length > 0 ? ' ' + fc.Data.join(' and ') : '');
            }
            return text;
        }, this);

        // constructs a new data list object
        constructor() {
            super();
            this.reset();
            this.SortCriteria.subscribe((newVal) => this.sort(), this);
        }

        // resets the list and criteria as needed
        public reset(full: boolean = true): void {
            this.List.removeAll();
            this.AppliedCriteria(null);
            this.Modified(null);
            if (this.CriteriaObject && full)
                this.CriteriaObject.reset();
        }

        // override validate to not call it on properties
        public validate(force: boolean): void {
            if (force) this.Validated = false;
            if (this.Validated) return;
            this.ValidationErrors.Errors.removeAll();
            if (this.CriteriaObject) {
                this.CriteriaObject.validate(force);
                this.ValidationErrors.mergeWith(this.CriteriaObject.ValidationErrors);
            }
            this.validateSelf();
            this.Validated = true;
        }

        // initializes data object list's data from the specified JSON object
        public fromJSON(obj, options?) {
            if (!$.isArray(obj)) return;
            let preserveSelection: boolean = options && options.preserveSelection; // false by default
            let sel = preserveSelection ? this.getSelectedRows() : [];
            let keys: Array<ListSortField> = this.Properties.filter(p => p.IsKey).map(p => new ListSortField(p.Name));

            var objects: Array<DataRow> = new Array<DataRow>();
            for (var i = 0; i < obj.length; i++) {
                var dr: DataRow = new DataRow(this);
                dr.fromJSON(obj[i]);
                objects.push(dr);
                if (preserveSelection)
                    dr._selected(sel.some(r => this.sameEntity(r, dr, keys), this));
            }
            this.List(objects);
            this.sort();
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

        /// Checks if two data rows represent the same entity. Can be overridden in subclasses.
        protected sameEntity(r1: DataRow, r2: DataRow, keys: Array<ListSortField>): boolean {
            return !r1 || !keys || keys.length == 0 ? false : r1.compareTo(r2, keys) == 0;
        }

        public sort() {
            if (this.SortCriteria && this.SortCriteria().length > 0)
                this.List.sort((left, right) => left ? left.compareTo(right) : -1);
        }

        // Data list supports single selection
        public static SelectionModeSingle = 'single';

        // Data list supports multiple selection
        public static SelectionModeMultiple = 'multiple';

        /** Current selection mode for data list rows. Null means user selection is not supported */
        public RowSelectionMode: KnockoutObservable<string> = ko.observable<string>();

        /** Toggles selection of the given row according to the current row selection mode */
        public toggleSelection(row: DataRow) {
            let select = !row._selected();
            // deselect other rows if not multiple selection
            if (select && this.RowSelectionMode() !== DataListObject.SelectionModeMultiple)
                this.List().filter(dr => dr._selected() && dr !== row).forEach(dr => dr._selected(false));
            row._selected(select);
        }

        public getSelectedRows(): Array<DataRow> {
            return this.List().filter((r) => r._selected());
        }

        public setSelectedRows(selRows: Array<DataRow>) {
            this.clearSelectedRows();
            if (selRows) selRows.forEach(r => r._selected(true));
        }

        public clearSelectedRows() {
            this.getSelectedRows().forEach((r) => r._selected(false));
        }
    }
}