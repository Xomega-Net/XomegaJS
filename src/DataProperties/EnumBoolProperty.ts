// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A subtype of enumeration properties where the items represent boolean values.
    // It uses the boolean type for the transport format.
    export class EnumBoolProperty extends EnumProperty {

        //  Constructs a new IntegerProperty.
        constructor() {
            super();
        }

        // Converts a single value to a given format.
        // For the transport format it uses the header ID converted as a boolean.
        public convertValue(value: any, fmt: ValueFormat): any {
            if (fmt == ValueFormat.Transport && value instanceof Header) {
                var str = value.id.trim().toLowerCase();
                if (BooleanProperty.TrueStrings.indexOf(str) > -1) return true;
                if (BooleanProperty.FalseStrings.indexOf(str) > -1) return false;
            }
            return super.convertValue(value, fmt);
        }
    }
}