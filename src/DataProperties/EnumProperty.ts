// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    // A data property that has enumerated set of possible values
    // that come from a lookup table of the specified type.
    // Internally the values are stored as objects of type Header,
    // which can store ID, text and a number of additional attributes for the value.
    // When a value is being set to the property it tries to resolve it to a Header
    // by looking it up in the lookup table for the property, which is obtained
    // from a lookup cache of a given type.
    export class EnumProperty extends DataProperty {

        // Enumeration type, which is the type of a lookup table in the cache to be used for the property.
        // This field should be initialized externally by either a subclass property
        // or from within the data object.
        public EnumType: string;

        // The string format that is used to obtain the key field from the Header.
        // The default value points to the header ID (see Header.fieldId),
        // but it can be customized to point to another unique field or a combination of fields
        // in the header, e.g. a custom attribute that stores a unique abbreviation.
        public KeyFormat: string = Header.fieldId;

        // The string format for a header field or combination of fields that is used
        // to display the header as a string. The default value is to display the header text
        // (see Header.fieldText).
        public DisplayFormat: string = Header.fieldText;

        // Constructs a new EnumProperty.
        constructor() {
            super();
            this.compare = (h1: Header, h2: Header) => {
                var s1: string = this.convertValue(h1, ValueFormat.DisplayString);
                var s2: string = this.convertValue(h2, ValueFormat.DisplayString);
                if (s1 != null && s1.localeCompare) return s1.localeCompare(s2);
                else return s1 < s2 ? -1 : s1 > s2 ? 1 : 0;
            };
            this.updateValue = (type: string) => {
                // prevent from changing the modification state
                var mod = this.Modified();
                this.Modified(null); // prevent forced validation
                var h: Header = this.InternalValue();
                if (h instanceof Header && !h.isValid)
                    this.InternalValue(h.id);
                this.Modified(mod);
            };
            this.updateList = (type: string) => {
                this.updateValueList();
                this.removeWaitItem(this.updateList);
            };
        }

        // A function to filter allowed items. By default only active items are allowed.
        public filter(h: Header): boolean {
            return h != null && h.isActive && this.matchesCascadingProperties(h);
        }

        // A function to compare values for sorting. By default items are sorted by their display string.
        public compare: (h1: Header, h2: Header) => number;

        // callback to update value when lookup table is ready
        public updateValue: (type: string) => void;

        // callback to update value list when lookup table is ready
        private updateList: (type: string) => void;

        // An instance of local lookup table when the possible values are not globally cached,
        // but depend on the current state of the data object.
        private localLookupTable: LookupTable;

        // Gets the lookup table for the property. The default implementation uses the <see cref="EnumType"/>
        // to find the lookup table in the lookup cache specified by the <see cref="CacheType"/>.
        // <returns>The lookup table to be used for the property.</returns>
        protected getLookupTable(onReadyCallback?: (type: string) => void): LookupTable {
            if (this.localLookupTable != null) return this.localLookupTable;
            return LookupCache.current.getLookupTable(this.EnumType, onReadyCallback);
        }

        // Sets local lookup table for the property, blanks out the current value if it's not in the table
        // and notifies listeners about updated value list
        public setLookupTable(table: LookupTable) {
            this.localLookupTable = table;
            if (table && !table.lookupById(this.TransportValue()))
                this.InternalValue(null);
            else if (this.updateValue) this.updateValue(null);
            if (this.updateValueList) this.updateValueList();
        }

        // Converts a single value to a given format. For internal format
        // this method tries to convert the value to a header by looking it up
        // in the lookup table. For the transport format it uses the header ID.
        // For DisplayString and EditString formats it displays the header formatted according
        // to the specified DisplayFormat or KeyFormat respectively.
        public convertValue(value: any, format: ValueFormat): any {
            var h: Header = <Header>value;
            if (format == ValueFormat.Internal) {
                if (value instanceof Header && h.type == this.EnumType) return value;
                var str: string = ("" + value).trim();
                var tbl: LookupTable = this.getLookupTable(this.updateValue);
                if (tbl != null) {
                    h = null;
                    if (this.KeyFormat != Header.fieldId) h = tbl.lookupByFormat(this.KeyFormat, str);
                    if (h == null) h = tbl.lookupById(str);
                    if (h != null) {
                        h.defaultFormat = this.KeyFormat;
                        return h;
                    }
                }
                h = new Header(this.EnumType, str, null);
                h.isValid = false;
                return h;
            }
            else if (value instanceof Header) {
                if (format == ValueFormat.Transport) return h.id;
                if (format == ValueFormat.EditString) return h.toString(this.KeyFormat);
                if (format == ValueFormat.DisplayString) return h.toString(this.DisplayFormat);
            }
            return super.convertValue(value, format);
        }

        // A function that is used by default as the possible items provider
        // for the property by getting all possible values from the lookup table
        // filtered by the specified filter function and ordered by
        // the specified compare function.
        public getPossibleValues(): Array<any> {
            var res: Array<Header>;
            var tbl: LookupTable = this.getLookupTable(this.updateList);
            if (tbl != null) {
                res = tbl.getValues(this.filter, this);
                if (this.compare) res = res.sort(this.compare);
            }
            else {
                this.addWaitItem(this.updateList);
            }
            return res;
        }

        // A dictionary that maps additional attributes that each possible value of this property may have
        // to other properties that could be used to implement cascading restrictions of the possible values
        // based on the current values of other properties.
        private cascadingProperties: Object = new Object();

        // Makes the list of possible values dependent on the current value(s) of another property,
        // which would be used to filter the list of possible values by the specified attribute.
        public setCascadingProperty(attribute: string, prop: DataProperty)
        {
            var oldProp: CascadingProperty = this.cascadingProperties[attribute];
            if (oldProp) {
                oldProp.subscription.dispose();
                delete this.cascadingProperties[attribute];
            }

            if (prop != null) {
                this.cascadingProperties[attribute] = new CascadingProperty(prop,
                    prop.InternalValue.subscribe((newVal) => {
                        if (!this.isNull() && this.filter) {
                            if (this.IsMultiValued) {
                                var lst: Array<any> = this.InternalValue();
                                this.InternalValue(lst.filter(this.filter, this));
                            }
                            else if (!this.filter(this.InternalValue()))
                                this.InternalValue(null);
                        }
                        this.updateValueList();
                    }, this));
            }
        }

        // The method that determines if a given possible value matches the current values
        // of all cascading properties using the attribute specified for each property.
        // Cascading properties with blank values are ignored, i.e. a blank value
        // is considered to match any value.
        // This method is used as part of the default filter function <see cref="IsAllowed"/>,
        // but can also be used separately as part of a custom filter function.
        // Parameter h: The possible value to match against cascading properties.
        // It should have the same attributes as specified for each cascading property.</param>
        // Returns: True, if the specified value matches the current value(s) of all cascading properties,
        // false otherwise.
        public matchesCascadingProperties(h: Header): boolean {
            for (var attr in this.cascadingProperties)
            {
                if (! this.cascadingProperties.hasOwnProperty(attr) ||
                    ! (this.cascadingProperties[attr] instanceof CascadingProperty)) continue;

                var p: DataProperty = this.cascadingProperties[attr].property;
                var pv = p.TransportValue(); // use transport values (IDs) for correct comparison
                // resolve attribute to transport though internal first
                // to handle possible string/number differences
                var hv = p.resolveValue(h.attr[attr], ValueFormat.Internal);
                hv = p.resolveValue(hv, ValueFormat.Transport);
                if (p.isNull() || p.isValueNull(hv, ValueFormat.Transport)) continue;

                var match: boolean;
                if ($.isArray(hv)) {
                    if ($.isArray(pv)) {
                        match = $.grep(pv, (v) => {
                            return $.inArray(v, hv) > -1;
                        }).length > 0;
                    } else match = $.inArray(pv, hv) > -1;
                } else match = $.isArray(pv) ? $.inArray(hv, pv) > -1 : (hv == pv);

                if (!match) return false;
            }
            return true;
        }
    }

    // Internal data structure to hold a property and a subscription for cascading selection
    class CascadingProperty {

        public property: DataProperty;
        public subscription: KnockoutSubscription;

        constructor(prop: DataProperty, subscr: KnockoutSubscription) {
            this.property = prop;
            this.subscription = subscr;
        }
    }
}