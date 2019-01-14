// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    // A data property that has a string value. The maximum length of the string
    // can be specified by setting the DataProperty.Size on the data property.
    export class TextProperty extends DataProperty {
        //  Constructs a new TextProperty.
        constructor() {
            super();
            this.Validators.push(TextProperty.validateSize);
        }

        // Converts a single value to a given format, which is always a string.
        public convertValue(value: any, format: ValueFormat): any {
            if (DataProperty.isTypedFormat(format))
                return '' + value;
            return super.convertValue(value, format);
        }

        // A validation function that checks if the value length is not greater
        // than the property size and reports a validation error if it is.
        public static validateSize(dp: DataProperty, value: any) {
            if (dp != null && !dp.isValueNull(value, ValueFormat.Internal)
                && dp.Size > 0 && ('' + value).length > dp.Size)
                dp.ValidationErrors.addError("{0} cannot be longer than {1} characters. Invalid value: {2}.", dp, dp.Size, value);
        }
    }

    // A data property that holds GUID values.
    export class GuidProperty extends TextProperty {

        //  Constructs a new GuidProperty.
        constructor() {
            super();
        }
    }
}