// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A data property that holds integer values.
    export class IntegerProperty extends DecimalProperty {

        //  Constructs a new IntegerProperty.
        constructor() {
            super();
        }

        // Converts a single value to a given format. For typed formats
        // this method tries to convert various types of values to an integer.
        public convertValue(value: any, fmt: ValueFormat): any {
            if (DataProperty.isTypedFormat(fmt)) {
                if (typeof value === 'number') return value;
                if (this.isValueNull(value, fmt)) return null;
                return isNaN(value) ? value : parseInt('' + value);
            }
            return super.convertValue(value, fmt);
        }
    }

    // A data property that holds non-negative integer values.
    export class PositiveIntegerProperty extends IntegerProperty {

        //  Constructs a new PositiveIntegerProperty.
        constructor() {
            super();
            this.MinimumValue = 0;
        }
    }
}