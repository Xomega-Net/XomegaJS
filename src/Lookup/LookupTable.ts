// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A self-indexing lookup table. The data set for the table is based on a list of values.
    // The table allows looking up values based on any string represenation of the value as defined 
    // by the format string that you pass in.
    // If the data is not indexed by that format, the table will build and cache the index first.
    export class LookupTable {

        // A type string for the lookup table.
        public type: string;

        // Errors that occurred during loading of this lookup table
        public errors: ErrorList = new ErrorList();

        // Constructs a lookup table of the given type from the specified errors
        public static fromErrors(type: string, errors: ErrorList): LookupTable {
            var res: LookupTable = new LookupTable(type, [], false);
            res.errors = errors;
            return res;
        }

        // A flag of whether or not to use case-sensitive lookups.
        private caseSensitive: boolean;

        // Raw data as a list.
        private data: Array<Header>;

        // Indexed data by key format that is used to get the key.
        private indexedData = {};

        // Constructs a new lookup table from the specified data set.
        constructor(type: string, data: Array<Header>, caseSensitive: boolean) {
            this.type = type;
            this.data = data;
            this.caseSensitive = caseSensitive;
            for (var i = 0; i < data.length; i++) data[i].type = type;
        }

        // Deserializes a LookupTable object from JSON that contains a serialized Xomega Framework LookupTable.
        public static fromJSON(obj): LookupTable {
            var data: Array<Header> = obj.data.map((val, idx, arr) => Header.fromJSON(val));
            var tbl: LookupTable = new LookupTable(obj.Type, data, obj.caseSensitive);
            return tbl;
        }

        // Get a copy of the table values filtered by the supplied function.
        // Only values that match the filter will be cloned, which is better for performance.
        public getValues(filterFunc = null, thisArg = null): Array<Header> {
            var lst: Array<Header> = this.data;
            if (filterFunc != null) lst = lst.filter(filterFunc, thisArg);
            return <Array<Header>>lst.map((h) => h.clone());
        }

        // Looks up a Header item by the id field.
        public lookupById(id: string): Header {
            return this.lookupByFormat(Header.fieldId, id);
        }

        // Looks up an item in the table by a value of the item string representation
        // specified by the supplied format parameter. If the table is not indexed
        // by the given format, it builds such an index first.
        // If multiple items have the same value for the given format, then only the
        // first one will be returned and the rest of them will be stored in an attribute
        // with a name composed from the '_grp:' constant and the format string.
        public lookupByFormat(fmt: string, value: string): Header {
            var tbl = this.indexedData[fmt];
            if (typeof tbl === "undefined")
                tbl = this.buildIndexedTable(fmt);
            var res: Header = tbl[this.caseSensitive ? value : value.toUpperCase()];
            if (res != null) return res; // res.clone(); is safer, but worse performing
            return null;
        }

        // Clears all indexes in the table.
        // The indexes will be rebuilt as needed at the first subsequent attempt to look up a value by any format.
        public resetIndexes() {
            this.indexedData = {};
        }

        // Clears an index for the given format. The index will be rebuilt at the next attempt
        // to look up a value by this format.
        public clearIndex(fmt: string) {
            delete this.indexedData[fmt];
        }

        // Builds an index for the specified format.
        private buildIndexedTable(format: string): any {
            var tbl = {};
            for (var i = 0; i < this.data.length; i++) {
                var h: Header = this.data[i];
                if (h == null) continue;
                var key: string = h.toString(format);
                if (!this.caseSensitive) key = key.toLocaleUpperCase();
                var h1: Header = tbl[key];
                if (typeof h1 !== "undefined")
                    h1.addToAttribute("_grp:" + format, h);
                else tbl[key] = h;
            }
            this.indexedData[format] = tbl;
            return tbl;
        }
    }
}