// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // A data property that holds numeric currency values.
    export class MoneyProperty extends DecimalProperty {

        // Default format for displaying currency.
        public static DefaultMoneyFormat: string = "${0}";

        //  Constructs a new MoneyProperty.
        constructor() {
            super();
            this.FractionDigits = 2;
            this.DisplayFormat = MoneyProperty.DefaultMoneyFormat;
        }
    }

    // A data property that holds non-negative numeric currency values.
    export class PositiveMoneyProperty extends MoneyProperty {

        //  Constructs a new PositiveMoneyProperty.
        constructor() {
            super();
            this.MinimumValue = 0;
        }
    }
}