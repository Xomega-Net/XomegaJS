// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // A base class for properties that contain a piece of data.
    // The data could be a single value or a list of values based on the property's <c>IsMultiValued</c> flag.
    // While the member to store the value is untyped, the actual values stored in the property
    // are always converted to the internal format whenever possible, which would be typed.
    // Data property also provides support for value conversion, validation and modification tracking.
    // It can also provide a list of possible values (items) where applicable.
    export class DataProperty extends BaseProperty implements IValidatable, IModifiable {

        // Checks if the current format is one of the string formats.
        public static isStringFormat(format: ValueFormat): boolean {
            return format === ValueFormat.EditString || format === ValueFormat.DisplayString;
        }

        // Checks if the current format is one of the typed formats.
        public static isTypedFormat(format: ValueFormat): boolean {
            return format === ValueFormat.Internal || format === ValueFormat.Transport;
        }

        // The members to store the value of the data property.
        // If the property is multivalued this will be pointing to a list of values.
        private value: KnockoutObservable<any>;

        // Returns the property value as it is stored internally.
        public InternalValue: KnockoutObservable<any>;

        // Returns the property value in a display string format.
        // Multiple values are each converted to the display string format and combined into a delimited string.
        public DisplayStringValue: KnockoutObservable<any>;

        // Returns the property value in an edit string format.
        // Multiple values are each converted to the edit string format and combined into a delimited string.
        public EditStringValue: KnockoutObservable<any>;

        // Returns the property value in a transport format.
        // Multiple values will be returned as a list of values converted to the transport format.
        public TransportValue: KnockoutObservable<any>;

        // Gets or sets the modification state of the property. Null means the property value has never been set.
        // False means the value has been set only once (initialized).
        // True means that the value has been modified since it was initialized.
        public Modified: KnockoutObservable<boolean> = ko.observable<boolean>();

        // Constructs a data property
        constructor() {
            super();

            this.value = ko.observable<any>();
            this.value.equalityComparer = function (a, b) {
                if (a && !b || !a && b) return false;
                if (!a && !b && typeof a === typeof b) return true; // account for undefined/null/false difference
                if (a && $.isFunction(a.equals)) return a.equals(b);
                if (b && $.isFunction(b.equals)) return b.equals(a);
                return a === b;
            };

            this.InternalValue = ko.computed({
                read: () => { return this.value(); },
                write: (value: any) => {
                    var newVal = this.resolveValue(value, ValueFormat.Internal);
                    this.value(newVal);
                },
                owner: this
            });

            this.DisplayStringValue = ko.computed({
                read: () => {
                    return this.resolveValue(this.InternalValue(), ValueFormat.DisplayString);
                },
                write: (value: any) => { this.InternalValue(value); },
                owner: this
            });

            this.EditStringValue = ko.computed({
                read: () => {
                    return this.resolveValue(this.InternalValue(), ValueFormat.EditString);
                },
                write: (value: any) => { this.InternalValue(value); },
                owner: this
            });

            this.TransportValue = ko.computed({
                read: () => {
                    return this.resolveValue(this.InternalValue(), ValueFormat.Transport);
                },
                write: (value: any) => { this.InternalValue(value); },
                owner: this
            });

            // subscribe at the end, since validation uses InternalValue, which needs to be updated first
            this.value.subscribe((newVal) => {
                // set modified to false the first time the value is populated,
                // and to true when it is subsequently changed
                if (this.Modified() == null)
                    this.Modified(false);
                else if (this.Editable()) { // track modifications for editable properties only
                    this.Modified(true);
                    this.validate(true); // don't validate unmodified value
                }
            }, this);
        }

        // Performs additional property initialization after all other properties and child objects
        // have been already added to the parent object and would be accessible from within this method.
        public onInitialized() {
            // if init changed property settings that affect any calculated values (e.g. NullString) between 
            // construction and now, then we need to notify all dependents to update their cached latest value.
            this.InternalValue.notifySubscribers(this.value());
            this.updateValueList();
        }

        // reset the data property to the default value
        public reset(): void {
            this.InternalValue(null);
            this.ValidationErrors.Errors.removeAll();
        }

        // Gets or sets whether the property contains multiple values (a list) or a single value.
        public IsMultiValued: boolean = false;

        // Gets or sets the string to display when the property value is null.
        // Setting such string as a value will be considered as setting the value to null.
        // The default is empty string.
        public NullString: string = "";

        // Gets or sets the string to display when the property value is restricted and not allowed to be viewed (e.g. N/A).
        // The default is empty string.
        public RestrictedString: string = "";

        // Gets or sets the separators to use for multivalued properties to parse the list of values from the input string.
        // The default is comma, semicolon and a new line.
        public ParseListSeparators: RegExp = /;|,|\r\n/;

        // Gets or sets the separator to use for multivalued properties to combine the list of values into a display string.
        // The default is comma with a space.
        public DisplayListSeparator: string = ", ";

        // Gets or sets the maximum length for each property value when the value is of type string.
        // The default is null, which means there is no maximum length.
        public Size: number;

        // A function to determine if the given value is considered to be null for the given format.
        // Default implementation returns true if the value is null, is an empty list,
        // is a string with blank spaces only or is equal to the NullString for any format.
        // Subclasses can override this function to differentiate by the value format
        // or to provide different or additional rules.
        public isValueNull(value: any, format: ValueFormat): boolean {
            if (value === null || typeof value === 'undefined') return true;
            if ($.isArray(value)) {
                return value.length === 0;
            }
            var str = value.toString().trim();
            return str == "" || str === this.NullString;
        }

        // Checks if the current property value is null.
        public isNull(): boolean { return this.isValueNull(this.value(), ValueFormat.Internal); }

        // Sets new value for the property.
        public setValue(value: any, format: ValueFormat) {
            var newVal = this.resolveValue(value, ValueFormat.Internal, format);
            this.value(newVal);
        }

        // Resolves the given value or a list of values to the specified format based on the current property configuration.
        // If the property is restricted or the value is null and the format is string based,
        // the <c>RestrictedString</c> or <c>NullString</c> are returned respectively.
        // If the property is multivalued it will try to convert the value to a list or parse it into a list if it's a string
        // or just add it to a new list as is and then convert each value in the list into the given format.
        // Otherwise it will try to convert the single value to the given format.
        // If a custom value converter is set on the property, it will be used first before the default property conversion rules are applied.
        public resolveValue(value: any, outFormat: ValueFormat, inFormat?: ValueFormat): any {
            if (this.AccessLevel() === AccessLevel.None)
                return outFormat == ValueFormat.DisplayString ? this.RestrictedString : value;

            if (this.isValueNull(value, outFormat))
                return outFormat == ValueFormat.DisplayString ? this.NullString : null;

            if (this.IsMultiValued) {
                var lst: Array<any>;
                if ($.isArray(value)) lst = value;
                else if (typeof value === "string") {
                    lst = value.split(this.ParseListSeparators);
                    lst = lst.map((str) => { return str.trim(); });
                    lst = lst.filter((str) => { return str !== "" });
                }
                else lst = [value];
                lst = lst.map((val) => this.convertValue(val, outFormat), this);
                return this.convertList(lst, outFormat);
            }
            else {
                return this.convertValue(value, outFormat, inFormat);
            }
        }

        // Converts a single value to a given format. The default implementation does nothing to the value,
        // but subclasses can implement the property specific rules for each format.
        public convertValue(value: any, outFormat: ValueFormat, inFormat?: ValueFormat): any {
            return value;
        }

        // Converts a list of values to the given format.
        // Default implementation returns the list as is for the typed formats and 
        // uses the DisplayListSeparator to concatenate the values for any string format.
        // Subclasses can override this behavior to differentiate between the <c>DisplayString</c> format
        // and the <c>EditString</c> format and can also provide custom delimiting, e.g. comma-separated
        // and a new line between every five values to get five comma-separated values per line.
        public convertList(list: Array<any>, format: ValueFormat): any {
            if (DataProperty.isTypedFormat(format)) return list;
            return list.join(this.DisplayListSeparator);
        }

        // Returns if the current property value has been validated and is valid, i.e. has no validation errors.
        public isValid(validate: boolean = true): boolean {
            if (validate) this.validate();
            return this.ValidationErrors && !this.ValidationErrors.hasErrors();
        }

        // The list of validation errors for the property.
        public ValidationErrors: ErrorList = new ErrorList();

        // Validation status of the property
        public Validated: boolean = false;

        // A list of property validators. Default is the required validator
        public Validators: Array<Function> = new Array<Function>(DataProperty.validateRequired);

        // Validate the property. If force flag is true, then always validate,
        // otherwise (by default) validate only if needed.
        public validate(force: boolean = false) {
            if (force) this.Validated = false;
            if (this.Validated) return;

            this.ValidationErrors.Errors().length = 0; // clear w/o notification to avoid recursion
            var value = this.InternalValue();
            if ($.isArray(value)) {
                var lst: Array<any> = value;
                lst.forEach((val) => {
                    this.Validators.forEach((validator) => { validator(this, val); }, this);
                }, this);
            }
            else this.Validators.forEach((validator) => { validator(this, value); }, this);
            this.Validated = true;
            this.ValidationErrors.Errors.valueHasMutated(); // notify now
        }

        // A standard validation function that checks for null if the value is required.
        public static validateRequired(dp: DataProperty, value: any) {
            if (dp != null && dp.Required() && dp.isValueNull(value, ValueFormat.Internal))
                dp.ValidationErrors.addError("{0} is required.", dp);
        }

        // Observable list of possible values for the data property
        public PossibleValues: KnockoutObservableArray<any> = ko.observableArray<any>();

        // A function to get a list of possible values for the property
        public getPossibleValues(): Array<any> {
            return null;
        }

        // update the list of possible values
        public updateValueList() {
            this.PossibleValues(this.getPossibleValues());
        }

        // An array of items that the property is waiting for before it is ready to handle data
        public waitingFor: Array<any> = [];

        // returns if the property is ready
        public isReady(): boolean {
            return this.waitingFor.length == 0;
        }

        // registers an item to wait for before the property is ready
        public addWaitItem(item) {
            if (this.waitingFor.indexOf(item) < 0)
                this.waitingFor.push(item);
        }

        // remove the item the property waits for and notify the parent object if the property is ready
        public removeWaitItem(item) {
            var idx = this.waitingFor.indexOf(item);
            if (idx >= 0) this.waitingFor.splice(idx, 1);
            if (this.isReady() && this.Parent()) this.Parent().checkIfReady();
        }
    }
}