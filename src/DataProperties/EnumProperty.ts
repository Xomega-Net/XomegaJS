// Copyright (c) 2020 Xomega.Net. All rights reserved.

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
                if (this.Parent() instanceof DataListObject) {
                    let listObj: DataListObject = <DataListObject>this.Parent();
                    let list = listObj.List();
                    for (let i = 0; i < list.length; i++) {
                        let h: Header = list[i][this.Name];
                        if (h instanceof Header && !h.isValid)
                            list[i][this.Name] = this.resolveValue(h.id, ValueFormat.Internal, ValueFormat.Transport);
                    }
                    listObj.List.notifySubscribers();
                } else {
                    let h: Header = this.InternalValue();
                    if (h instanceof Header && !h.isValid)
                        this.InternalValue(h.id);
                }
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

        // Cache loader with a local cache to use as a list of possible values for this property.
        public LocalCacheLoader: LocalLookupCacheLoader;

        // Gets the lookup table for the property. The default implementation uses the <see cref="EnumType"/>
        // to find the lookup table in the lookup cache specified by the <see cref="CacheType"/>.
        // <returns>The lookup table to be used for the property.</returns>
        protected getLookupTable(onReadyCallback?: (type: string) => void): LookupTable {
            var cache = (this.LocalCacheLoader != null) ? this.LocalCacheLoader.getCache() : LookupCache.current;
            var type = (this.LocalCacheLoader != null) ? this.LocalCacheLoader.TableType : this.EnumType;
            return cache.getLookupTable(type, onReadyCallback);
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

        private cacheLoaderSources: Object = new Object();

        // Sets a source data property for the specified input parameter of the local cache loader.
        // The value of the input parameter will come from the source property, and the cache will be reloaded
        // whenever the value of the source property changes.
        public setCacheLoaderParameters(parameter: string, sourceProperty: DataProperty) {
            var oldProp: CascadingProperty = this.cacheLoaderSources[parameter];
            if (oldProp) {
                oldProp.subscription.dispose();
                delete this.cacheLoaderSources[parameter];
            }

            if (sourceProperty != null) {
                this.cacheLoaderSources[parameter] = new CascadingProperty(sourceProperty,
                    sourceProperty.InternalValue.subscribe(this.cacheLoaderParameterChange, this));
            }
        }

        // Listens to the changes in values of the source parameter properties,
        // reloads the local cache with the new parameters, clears any current values
        // that are no longer match valid for the new cache. Also fires an event
        // to notify the listeners that the list of possible values changed.
        private cacheLoaderParameterChange() {
            if (this.LocalCacheLoader == null) return;
            var newParams = {};
            for (var param in this.cacheLoaderSources) {
                if (!this.cacheLoaderSources.hasOwnProperty(param) ||
                    !(this.cacheLoaderSources[param] instanceof CascadingProperty)) continue;
                newParams[param] = (<CascadingProperty>this.cacheLoaderSources[param]).property.TransportValue();
            }
            this.LocalCacheLoader.setParameters(newParams, () => {
                this.clearInvalidValues();
                this.updateValueList();
            });
        }

        // Clears values that don't match the current value list
        // without changing the modification state of the property.
        public clearInvalidValues() {
            if (this.isNull()) return;
            var mod: boolean = this.Modified();
            this.InternalValue(this.TransportValue());
            if (this.IsMultiValued) {
                var values: Array<Header> = this.InternalValue();
                this.InternalValue(values.filter((h) => h.isValid));
            } else if (!this.InternalValue().isValid)
                this.InternalValue(null);
            this.Modified(mod); // don't change the modified flag for initial load
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

        /// True if null cascading value matches only values with attributes set to null.
        /// False if cascading value matches any value.
        public cascadingMatchNulls: boolean;

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
                // resolve attribute to transport through internal first
                // to handle possible string/number differences
                var hv = p.resolveValue(h.attr[attr], ValueFormat.Internal);
                hv = p.resolveValue(hv, ValueFormat.Transport);
                if (p.isNull() && !this.cascadingMatchNulls) continue;

                var match: boolean;
                if ($.isArray(hv)) {
                    if ($.isArray(pv)) {
                        match = $.grep(pv, (v) => {
                            return $.inArray(v, hv) > -1;
                        }).length > 0;
                    } else match = $.inArray(pv, hv) > -1;
                } else if (hv) match = $.isArray(pv) ? $.inArray(hv, pv) > -1 : (hv == pv);
                else match = (pv == null);

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