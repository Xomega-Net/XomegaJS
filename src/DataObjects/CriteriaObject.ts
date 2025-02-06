// Copyright (c) 2020 Xomega.Net. All rights reserved.

/// <reference path="DataObject.ts"/>

module xomega {

    export class CriteriaObject extends DataObject {

        public CriteriaFieldGroups: any;

        /// Determines if any criteria are populated
        public hasCriteria(): boolean {
            return this.Properties.filter(p => p instanceof DataProperty && !(p instanceof OperatorProperty))
                .some(p => !(p as DataProperty).isNull());
        }

        // convert data object's data to a JSON object using the provided contract if any
        public toJSON(contract?: any, options?): any {
            let res = {};
            for (let prop in this.CriteriaFieldGroups) {
                if (!this.CriteriaFieldGroups.hasOwnProperty(prop)) continue;
                let p: CriteriaPropertyGroup = this.CriteriaFieldGroups[prop];
                if (p instanceof CriteriaPropertyGroup && p.hasValues() && (!contract || contract.hasOwnProperty(prop))) {
                    var fc = p.toFieldCriteria();
                    if (fc.Operator)
                        res[`${prop}.Operator`] = fc.Operator;
                    if (fc.Values)
                        res[`${prop}.Values`] = fc.Values;
                }
            }
            return res;
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
        public getFieldsCriteria(): Array<FieldCriteriaDisplay> {
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
            let res: Array<FieldCriteriaDisplay> = new Array<FieldCriteriaDisplay>();
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
                    res.push(new FieldCriteriaDisplay(op.toString(), op.DisplayStringValue(), data));
                }
                else if (p instanceof DataProperty) {
                    let dp: DataProperty = <DataProperty>p;
                    if (dp.isNull()) continue;
                    res.push(new FieldCriteriaDisplay(dp.toString(), null, [dp.DisplayStringValue()]));
                }
            }
            return res;
        }
    }

    // Property group for field criteria
    export class CriteriaPropertyGroup {
        public Value: DataProperty;
        public Value2: DataProperty;
        public Operator: DataProperty;
        public DefaultOperator: string;

        public hasValues(): boolean {
            return this.Operator && !this.Operator.isNull() || !this.Value.isNull();
        }

        getDefaultOperator(): string {
            if (this.DefaultOperator)
                return this.DefaultOperator;
            return this.Value.IsMultiValued ? "In" : "EQ";
        }

        public toFieldCriteria(): FieldCriteria {
            var res: FieldCriteria = new FieldCriteria();
            res.Operator = (!this.Operator || this.Operator.isNull()) ? this.getDefaultOperator() : this.Operator?.TransportValue();
            if (this.Value.IsMultiValued)
                res.Values = this.Value.TransportValue();
            else if (this.Value2 && !this.Value2.isNull()) {
                res.Values = [this.Value.TransportValue(), this.Value2.TransportValue()];
            } else {
                res.Values = [this.Value.TransportValue()];
            }
            return res;
        }
    }

    // Field criteria display structure
    export class FieldCriteria {
        // operator
        public Operator: string;
        // values of associated data properties
        public Values: Array<any>;
    }

    // Field criteria display structure
    export class FieldCriteriaDisplay {

        // field label
        public Label: string;
        // operator
        public Operator: string;
        // values of associated data properties
        public Values: Array<string>;

        constructor(label: string, op: string, data: Array<string>) {
            this.Label = label;
            this.Operator = op;
            this.Values = data;
        }
    }
}