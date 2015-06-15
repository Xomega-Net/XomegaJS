// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // A DateTimeProperty for the time part only.
    export class TimeProperty extends DateTimeProperty {

        // Default time edit format
        public static DefaultEditFormat: string = 'HH:mm';

        // A Boolean flag to control whether to treat a single integer under 24
        // as minutes or hours. The default is to treat it as hours.
        public MinutesCentric: boolean = false;

        // JSON transport format
        public static JsonFormat: string[] = ['HH:mm:ss.SSS', 'HH:mm:ss'];

        //  Constructs a new DateProperty.
        constructor() {
            super();
            this.valueType = "time";
            this.FormatOptions = {
                hour12: false, // use military style time by default for brevity
                hour: '2-digit',
                minute: 'numeric'
            };
            this.EditFormat = TimeProperty.DefaultEditFormat;
        }

        // Converts a single value to a given format. For typed formats
        // this method tries to convert various types of values to a DateTime.
        // It also handles parsing strings that are input without a colon for speed entry (e.g. 1500).
        public convertValue(value: any, fmt: ValueFormat): any {
            if (fmt === ValueFormat.Internal) {
                var dt: Date = new Date(0, 0, 0, 0, 0, 0, 0);
                var s = ('' + value).trim();
                var i = parseInt(s);
                var valid: boolean = true;
                if (/^\d+$/.test(s) && i >= 0) {
                    if (s.length == 4) {
                        i = parseInt(s.substr(0, 2));
                        if (i < 24) dt.setHours(i);
                        else valid = false;

                        i = parseInt(s.substr(2));
                        if (i < 59) dt.setMinutes(i);
                        else valid = false;
                    }
                    else if (i > 23 && i < 60 || i < 24 && this.MinutesCentric)
                        dt.setMinutes(i);
                    else if (i < 24) dt.setHours(i);
                    else valid = false;
                }
                else {
                    // try JSON format, ignoring fraction part
                    var m = moment(s, TimeProperty.JsonFormat, true);
                    if (m.isValid())
                        dt = m.toDate();
                    else // try edit format
                        dt = super.convertValue(value, fmt);
                    valid = dt instanceof Date;
                }
                return valid ? dt : value;
            }
            if (fmt === ValueFormat.Transport) {
                var str = value instanceof Date ? moment(value).format(TimeProperty.JsonFormat[0]) : value;
                return str;
            }
            return super.convertValue(value, fmt);
        }
    }
}