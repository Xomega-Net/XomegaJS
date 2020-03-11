// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A property that holds a decimal value represented as percent.
    export class PercentProperty extends DecimalProperty {

        // Default format for displaying percent.
        public static DefaultPercentFormat: Intl.NumberFormat = new Intl.NumberFormat(undefined, { style: 'percent' });

        //  Constructs a new PercentProperty.
        constructor() {
            super();
            this.DisplayFormat = PercentProperty.DefaultPercentFormat;
        }
    }

    // A percent property that allows only fractions between 0 and 1 (100%).
    export class PercentFractionProperty extends PercentProperty {

        //  Constructs a new PercentFractionProperty.
        constructor() {
            super();
            this.MinimumValue = 0;
            this.MaximumValue = 1;
        }
    }
}