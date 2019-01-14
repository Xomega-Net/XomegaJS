// Copyright (c) 2019 Xomega.Net. All rights reserved.

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

        // JSON transport format (for use with moment.js parser when not ISO compliant and can't be parsed by Date)
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
        public convertValue(value: any, outFormat: ValueFormat, inFormat?: ValueFormat): any {
            if (outFormat === ValueFormat.Internal) {
                if (value instanceof Date) return value;
                if (this.isValueNull(value, outFormat)) return null;
                if (inFormat === ValueFormat.Transport) {
                    // for optimal performance, transport format should be ISO-compliant to work well with native Date code
                    var v = new Date(value);
                    if (!isNaN(v.valueOf()))
                        return v;
                    // otherwise, try parsing with moment using configured JSON formats (can result in slow performance)
                    var m = moment(value, DateTimeProperty.JsonFormat, true);
                    if (!m.isValid())
                        return value;
                }
                // if not from transport layer, the value is expected to be in edit format
                if (moment.isMoment(value)) return value.toDate();
                m = moment(value, this.EditFormat);
                if (!m.isValid())
                    return value;
                // adjust short year inputs, treating '< 50' as current century and '>= 50' and '< 100' as the previous one
                if (m.year() < 100) {
                    var baseYear = ((moment().year() / 100) | 0) * 100;
                    if (m.year() >= 50) baseYear = baseYear - 100;
                    m.year(m.year() + baseYear);
                }
                return m.toDate();
            }
            if (outFormat === ValueFormat.Transport) {
                var str = JSON.stringify(value).replace(/^"/, "").replace(/"$/, "");
                return str;
            }
            if (DataProperty.isStringFormat(outFormat) && value instanceof Date && !this.isValueNull(value, outFormat)) {
                if (outFormat === ValueFormat.EditString)
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
            return super.convertValue(value, outFormat, inFormat);
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