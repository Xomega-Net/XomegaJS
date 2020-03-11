// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A data property that holds numeric currency values.
    export class MoneyProperty extends DecimalProperty {

        // Default format for displaying currency.
        public static DefaultMoneyFormat: Intl.NumberFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

        //  Constructs a new MoneyProperty.
        constructor() {
            super();
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