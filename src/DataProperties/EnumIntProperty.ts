// Copyright (c) 2020 Xomega.Net. All rights reserved.

/// <reference path="EnumProperty.ts"/>

module xomega {

    // A subtype of enumeration properties where the header IDs are always integers.
    // It uses a number type for the transport format.
    export class EnumIntProperty extends EnumProperty {

        //  Constructs a new IntegerProperty.
        constructor() {
            super();
        }

        // Converts a single value to a given format.
        // For the transport format it uses the header ID converted as an integer.
        public convertValue(value: any, fmt: ValueFormat): any {
            if (fmt == ValueFormat.Transport && value instanceof Header) {
                return parseInt(value.id);
            }
            return super.convertValue(value, fmt);
        }
    }
}