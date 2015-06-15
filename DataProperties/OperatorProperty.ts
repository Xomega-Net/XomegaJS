// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // A data property that has enumerated set of possible values
    // that come from a lookup table of the specified type.
    // Internally the values are stored as objects of type Header,
    // which can store ID, text and a number of additional attributes for the value.
    // When a value is being set to the property it tries to resolve it to a Header
    // by looking it up in the lookup table for the property, which is obtained
    // from a lookup cache of a given type.
    export class OperatorProperty extends EnumProperty {

        // The string format that is used to obtain the key field from the Header.
        // The name of the operator attribute that stores the number of additional
        // properties of the operator requires: 0, 1 or 2.
        private AttributeAddlProps: string = "addl props";

        // The name of the operator attribute that stores 1 or 0 to indicate
        // if the additional property can be multivalued.
        private AttributeMultival: string = "multival";

        // The name of the operator attribute that stores a fully qualified type
        // of the additional property, which this operator applies to.
        // It will also apply to all subclasses of this type. Multiple types can be specified.
        private AttributeType: string = "type";

        // The name of the operator attribute that stores a fully qualified type
        // of the additional property, which this operator does not apply to.
        // It won't also apply to all subclasses of this type. Multiple exclude types can be specified.
        // Exclude types should be generally more concrete than include types.
        private AttributeExcludeType: string = "exclude type";

        // The name of the operator attribute that stores the sort order
        // of the operators with respect to other operators.
        private AttributeSortOrder: string = "sort order";

        // The name of the operator attribute that stores 1 for null check operators
        // (Is Null or Is Not Null) to enable easily hiding or showing them.
        private AttributeNullCheck: string = "null check";

        // Gets or sets the name of the first additional property.
        // If the current operator property name ends with "Operator"
        // then the first initial property name is defaulted to the first part
        // of the current property name before the word "Operator".
        public AdditionalPropertyName: string;

        // Gets or sets the name of the second additional property.
        // If the first additional property name is initialized by default
        // than the second additional property name is defaulted to the first one
        // with the string "2" appended at the end.
        public AdditionalPropertyName2: string;

        // Gets or sets a Boolean to enable or disable display of the null check operators.
        public HasNullCheck: boolean = false;

        // Constructs a new OperatorProperty.
        constructor() {
            super();
            this.filter = this.isApplicable;

            this.compare = (h1: Header, h2: Header) => {
                var s1: string = h1.attr[this.AttributeSortOrder];
                var s2: string = h2.attr[this.AttributeSortOrder];
                return s1 < s2 ? -1 : s1 > s2 ? 1 : 0;
            };

            this.InternalValue.subscribe(this.onValueChanged, this);
        }

        // Default additional property names based on the name of this property
        public onInitialized() {
            if (this.AdditionalPropertyName == null && this.Name.match(/Operator$/))
                this.AdditionalPropertyName = this.Name.substring(0, this.Name.length - 8);
            if (this.AdditionalPropertyName2 == null && this.AdditionalPropertyName != null)
                this.AdditionalPropertyName2 = this.AdditionalPropertyName + "2";
            super.onInitialized();
        }

        // Determines if the given operator is applicable for the current additional properties
        // by checking the first additional property type and whether or not it's multivalued
        // and comparing it to the corresponding attributes of the given operator.
        // This method is used as a filter function for the list of operators to display.
        public isApplicable(oper: Header): boolean {
            var addlProp: DataProperty = this.Parent ? this.Parent()[this.AdditionalPropertyName] : null;

            var multiVal = oper.attr[this.AttributeMultival];
            if (addlProp == null && multiVal != null || addlProp != null && (
                multiVal == "0" && addlProp.IsMultiValued ||
                multiVal == "1" && !addlProp.IsMultiValued)) return false;

            var nullCheck = oper.attr[this.AttributeNullCheck];
            if (nullCheck == "1" && !this.HasNullCheck) return false;

            var type = oper.attr[this.AttributeType];
            var exclType = oper.attr[this.AttributeExcludeType];
            if (type == null && exclType == null) return true;
            if (addlProp == null) return false;

            // probe exclude types first
            if ($.isArray(exclType)) {
                for(var i = 0; i < exclType.length; i++)
                    if (this.typeMatches(addlProp, exclType[i])) return false;
            }
            else if (this.typeMatches(addlProp, exclType)) return false;

            // probe include types next
            if ($.isArray(type)) {
                for(i = 0; i < type.length; i++)
                    if (this.typeMatches(addlProp, type[i])) return true;
                return false;
            }
            return this.typeMatches(addlProp, type);
        }

        // Determines if the specified type or any of its base types match the provided name.
        private typeMatches(prop, name: string): boolean {
            var propClass = /(\w+)\(/.exec(prop.constructor.toString())[1];
            return (propClass == name) || prop.__proto__ != null && this.typeMatches(prop.__proto__, name);
        }

        // Updates the visibility and the Required flag of the additional properties
        // based on the currently selected operator. This method is triggered
        // whenever the current operator changes.
        private onValueChanged(newVal: Header) {
            var addlProp: DataProperty = this.Parent()[this.AdditionalPropertyName];
            var addlProp2: DataProperty = this.Parent()[this.AdditionalPropertyName2];
            if (addlProp == null) return;
            var depCnt = 0;
            if (!this.isNull()) depCnt = newVal.attr[this.AttributeAddlProps];
            addlProp.Visible(this.Visible() && depCnt > 0);
            addlProp.Required(addlProp.Visible());
            if (addlProp2 != null) {
                addlProp2.Visible(this.Visible() && depCnt > 1);
                addlProp2.Required(addlProp2.Visible());
            }
        }
    }
}