// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // Field criteria structure
    export class FieldCriteria {

        // field label
        public Label: string;
        // operator
        public Operator: string;
        // values of associated data properties
        public Data: Array<string>;

        constructor(label: string, op: string, data: Array<string>) {
            this.Label = label;
            this.Operator = op;
            this.Data = data;
        }
    }
}