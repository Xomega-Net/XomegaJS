// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // A data property that holds date/time values.
    export class DateTimeProperty extends DataProperty {

        // Default date time edit format
        public static DefaultEditFormat: string = 'YYYY-MM-DD HH:mm';

        // Default date time display format options that can be reset globally
        public static DefaultFormatOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour12: false, // use military style time by default for brevity
            hour: '2-digit',
            minute: 'numeric'
        };

        // JSON transport format
        public static JsonFormat: string[] = ['YYYY-MM-DDTHH:mm:ss.SSSSZ', 'YYYY-MM-DDTHH:mm:ss.SSS', 'YYYY-MM-DDTHH:mm:ss.SS', 'YYYY-MM-DDTHH:mm:ss.S', 'YYYY-MM-DDTHH:mm:ss'];

        // Custom date time edit format for this property
        public EditFormat: string;

        // Custom date time display format for this property
        public Format: Intl.DateTimeFormat;

        // Customizable date time display format options for this property
        public FormatOptions: Intl.DateTimeFormatOptions;

        // A string used to indicate the value type in the validation error
        public valueType: string = "date/time";

        //  Constructs a new DecimalProperty.
        constructor() {
            super();
            this.Validators.push(DateTimeProperty.validateDateTime);
            this.FormatOptions = $.extend(DateTimeProperty.DefaultFormatOptions);
            this.EditFormat = DateTimeProperty.DefaultEditFormat;
        }

        // Converts a single value to a given format. For typed formats
        // this method tries to convert various types of values to a Date.
        // For string formats it displays the internal Date formatted as date and time
        // according to the current locale and FormatOptions or the Format if set.
        public convertValue(value: any, fmt: ValueFormat): any {
            if (fmt === ValueFormat.Internal) {
                if (value instanceof Date) return value;
                if (moment.isMoment(value)) return value.toDate();
                if (this.isValueNull(value, fmt)) return null;
                var m = moment(value, DateTimeProperty.JsonFormat, true); // try transport format first
                if (!m.isValid()) {
                    m = moment(value, this.EditFormat); // if not in transport format, try edit format
                    if (!m.isValid())
                        return value;
                }
                // adjust short year inputs, treating '< 50' as current century and '>= 50' and '< 100' as the previous one
                if (m.year() < 100) {
                    var baseYear = ((moment().year() / 100) | 0) * 100;
                    if (m.year() >= 50) baseYear = baseYear - 100;
                    m.year(m.year() + baseYear);
                }
                return m.toDate();
            }
            if (fmt === ValueFormat.Transport) {
                var str = JSON.stringify(value).replace(/^"/, "").replace(/"$/, "");
                return str;
            }
            if (DataProperty.isStringFormat(fmt) && value instanceof Date && !this.isValueNull(value, fmt)) {
                if (fmt === ValueFormat.EditString)
                    return moment(value).format(this.EditFormat);

                // instantiate format once (if not set) as this is an expensive operation
                if (!this.Format) {
                    // the following construct returns a Collator for whaterver reason (MS bug?),
                    // so we assign through an untyped local variable to avoid compilation issue
                    var dtFmt: any = new Intl.DateTimeFormat([], this.FormatOptions);
                    this.Format = <Intl.DateTimeFormat>dtFmt;
                }
                return this.Format.format(value);
            }
            return super.convertValue(value, fmt);
        }

        // A validation function that checks if the value is a number and reports a validation error if not.
        public static validateDateTime(dp: DateTimeProperty, value: any) {
            if (dp != null && !dp.isValueNull(value, ValueFormat.Internal) && !(value instanceof Date))
                dp.ValidationErrors.addError("{0} has an invalid " + dp.valueType +
                    ": {1}. Please use the correct format, e.g. {2}.",
                    dp, value, dp.convertValue(new Date(), ValueFormat.EditString));
        }
    }
}