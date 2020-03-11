// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A data property that holds numeric values.
    export class DecimalProperty extends DataProperty {

        public static DefaultNumberFormat: Intl.NumberFormat = new Intl.NumberFormat();

        // The minimum valid value for the property.
        public MinimumValue: number;

        // The maximum valid value for the property.
        public MaximumValue: number;

        // The format for displaying the number as a string.
        public DisplayFormat: Intl.NumberFormat;

        //  Constructs a new DecimalProperty.
        constructor() {
            super();
            this.DisplayFormat = DecimalProperty.DefaultNumberFormat;
            this.Validators.push(DecimalProperty.validateNumber,
                DecimalProperty.validateMinimum, DecimalProperty.validateMaximum);
        }

        // Converts a single value to a given format. For typed formats
        // this method tries to convert various types of values to a decimal.
        // For string formats it displays the internal decimal formatted according
        // to the specified DisplayFormat if set.
        public convertValue(value: any, fmt: ValueFormat): any {
            if (DataProperty.isTypedFormat(fmt)) {
                if (typeof value === 'number') return value;
                if (this.isValueNull(value, fmt)) return null;
                return isNaN(value) ? value : parseFloat('' + value);
            }
            if (fmt == ValueFormat.DisplayString && typeof value === 'number' &&
                !this.isValueNull(value, fmt) && this.DisplayFormat) {
                return this.DisplayFormat.format(value);
            }
            return super.convertValue(value, fmt);
        }

        // A validation function that checks if the value is a number and reports a validation error if not.
        public static validateNumber(dp: DataProperty, value: any) {
            if (dp != null && !dp.isValueNull(value, ValueFormat.Internal) && typeof value !== 'number')
                dp.ValidationErrors.addError("{0} must be a number.", dp);
        }

        // A validation function that checks if the value is a decimal that is not less
        // than the property minimum and reports a validation error if it is.
        public static validateMinimum(dp: DecimalProperty, value: any) {
            if (dp.MinimumValue && (typeof value === 'number') && value < dp.MinimumValue)
                dp.ValidationErrors.addError("{0} cannot be less than {1}.", dp, dp.MinimumValue);
        }

        // A validation function that checks if the value is a decimal that is not greater
        // than the property maximum and reports a validation error if it is.
        public static validateMaximum(dp: DecimalProperty, value: any) {
            if (dp.MaximumValue && (typeof value === 'number') && value > dp.MaximumValue)
                dp.ValidationErrors.addError("{0} cannot be greater than {1}.", dp, dp.MaximumValue);
        }
    }

    // A data property that holds non-negative numeric values.
    export class PositiveDecimalProperty extends DecimalProperty {

        //  Constructs a new PositiveDecimalProperty.
        constructor() {
            super();
            this.MinimumValue = 0;
        }
    }
}