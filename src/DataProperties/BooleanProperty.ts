// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A data property that holds Boolean values.
    export class BooleanProperty extends DataProperty {

        // An array of strings that should be parsed as a true Boolean value.
        // To default values are: "true", "1", "yes".
        // It can also be set externally for a more precise control over this behavior.
        public static TrueStrings = [ "true", "1", "yes", "y" ];

        // An array of strings that should be parsed as a false Boolean value.
        // To default values are: "false", "0", "no".
        // It can also be set externally for a more precise control over this behavior.
        public static FalseStrings = [ "false", "0", "no", "n" ];

        //  Constructs a new BooleanProperty.
        constructor() {
            super();
        }

        // Converts a single value to a given format. For typed formats
        // this method tries to convert various types of values to a nullable Boolean
        // and may utilize lists of strings that represent true or false values
        // (see rueStrings and FalseStrings).
        public convertValue(value: any, format: ValueFormat): any {
            if (DataProperty.isTypedFormat(format)) {
                if (typeof value === 'boolean') return value;
                if (1 == value) return true;
                if (0 == value) return false;
                if (this.isValueNull(value, format)) return null;

                var str = ('' + value).trim().toLowerCase();
                if (BooleanProperty.TrueStrings.indexOf(str) > -1) return true;
                if (BooleanProperty.FalseStrings.indexOf(str) > -1) return false;
            }
            return super.convertValue(value, format);
        }
    }
}