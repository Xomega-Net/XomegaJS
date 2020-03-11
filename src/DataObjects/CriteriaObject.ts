// Copyright (c) 2020 Xomega.Net. All rights reserved.

/// <reference path="DataObject.ts"/>

module xomega {

    export class CriteriaObject extends DataObject {

        /// Determines if any criteria are populated
        public hasCriteria(): boolean {
            return this.Properties.filter(p => p instanceof DataProperty && !(p instanceof OperatorProperty))
                .some(p => !(p as DataProperty).isNull());
        }

        // Sets values from the given object and adjusts values for operators
        public fromJSON(obj, options?) {
            super.fromJSON(obj, options);
            // clear operators, for which associated properties are blank
            for (let prop in this) {
                let p: any = this[prop];
                if (!(p instanceof OperatorProperty)) continue;
                let op: OperatorProperty = p as OperatorProperty;
                let isBlank = true;
                for (let nm of [op.AdditionalPropertyName, op.AdditionalPropertyName2]) {
                    let dp = this.getDataProperty(nm);
                    if (dp && !dp.isNull()) isBlank = false;
                }
                if (isBlank) op.InternalValue(null);
            }
        }

        // gets an array of field criteria
        public getFieldsCriteria(): Array<FieldCriteria> {
            // make a map of object's properties
            let map = {};
            for (let prop in this) {
                let p: any = this[prop];
                if ((<Object>this).hasOwnProperty(prop) && p instanceof BaseProperty)
                    map[(<BaseProperty>p).Name] = p;
            }
            // process operators if any
            for (let prop in map) {
                let p: any = map[prop];
                if (!(p instanceof OperatorProperty)) continue;
                let op: OperatorProperty = <OperatorProperty>p;
                // clear mapping for bound properties
                if (op.AdditionalPropertyName)
                    map[op.AdditionalPropertyName] = null;
                if (op.AdditionalPropertyName2)
                    map[op.AdditionalPropertyName2] = null;
            }
            // make array of settings
            let res: Array<FieldCriteria> = new Array<FieldCriteria>();
            for (let prop in map) {
                let p: any = map[prop];
                if (p instanceof OperatorProperty) {
                    let op: OperatorProperty = <OperatorProperty>p;
                    if (op.isNull()) continue;
                    let data: Array<string> = new Array<string>();
                    let dp1: DataProperty = op.AdditionalPropertyName ? <DataProperty>this[op.AdditionalPropertyName] : null;
                    if (dp1 && !dp1.isNull() && dp1.Visible()) data.push(dp1.DisplayStringValue());
                    let dp2: DataProperty = op.AdditionalPropertyName2 ? <DataProperty>this[op.AdditionalPropertyName2] : null;
                    if (dp2 && !dp2.isNull() && dp2.Visible()) data.push(dp2.DisplayStringValue());
                    res.push(new FieldCriteria(op.toString(), op.DisplayStringValue(), data));
                }
                else if (p instanceof DataProperty) {
                    let dp: DataProperty = <DataProperty>p;
                    if (dp.isNull()) continue;
                    res.push(new FieldCriteria(dp.toString(), null, [dp.DisplayStringValue()]));
                }
            }
            return res;
        }
    }

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