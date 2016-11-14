// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // A DateTimeProperty for the date part only.
    export class DateProperty extends DateTimeProperty {

        // Default date edit format
        public static DefaultEditFormat: string = 'YYYY-MM-DD';

        //  Constructs a new DateProperty.
        constructor() {
            super();
            this.valueType = "date";
            this.FormatOptions = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour12: false, // use military style time by default for brevity
            };
            this.EditFormat = DateProperty.DefaultEditFormat;
        }

        // Converts a single value to a given format. For typed formats
        // this method tries to convert various types of values to a Date.
        // For string formats it displays the internal Date formatted as date
        // according to the current locale and FormatOptions or the Format if set.
        public convertValue(value: any, outFormat: ValueFormat, inFormat?: ValueFormat): any {
            if (DataProperty.isTypedFormat(outFormat)) {
                var dt: Date = super.convertValue(value, outFormat, inFormat);
                if (dt instanceof Date) {
                    dt.setHours(0);
                    dt.setMinutes(0);
                    dt.setSeconds(0);
                    dt.setMilliseconds(0);
                }
                return dt;
            }
            return super.convertValue(value, outFormat, inFormat);
        }
    }
}