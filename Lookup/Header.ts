// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // A general-purpose class that represents the header information of any object,
    // that includes the most relevant fields to identify the object and any additional attributes
    // that can be used for filtering or to support various display options.
    // The Type string of a header determines the class of objects it represents.
    // It has also a string based internal ID and a Text field for display purposes.
    // It can also have any number of additional named attributes that can hold any value or a list of values.
    export class Header {

        // A constant that represents the ID field when used as part of the display format.
        public static fieldId = "[i]";

        // A constant that represents the Text field when used as part of the display format.
        public static fieldText = "[t]";

        // A constant that represents a named attribute when used as part of the display format.
        // The placeholder {0} should be replaced with the attribute name by calling
        // format(attrPattern, attrName);
        public static attrPattern = "[a:{0}]";

        // The Type string of a header determines the class of objects it represents.
        public type: string;

        // String-based ID that should be unique for all headers of the given type.
        public id: string;

        // A user friendly text that identifies this header.
        public text: string;

        // A flag indicating if the header was properly constructed with both ID and the text.
        // This is typically False if the header was not found in the corresponding lookup table
        // and therefore was merely constructed from the user input.
        public isValid: boolean = true;

        // A flag indicating if the header is currently active.
        // Typically, only the active headers can be selected by the user,
        // but the code can still look up and display an inactive header.
        public isActive: boolean = true;

        // Default format to use when converting the header to a string. By default, it displays the header ID.
        public defaultFormat: string = Header.fieldId;

        // Arbibtrary additional attributes
        public attr: any = {};

        // Constructs a valid header of the given type with the specified ID and text.
        constructor(type: string, id: string, text: string) {
            this.type = type;
            this.id = id;
            this.text = text;
        }

        // Deserializes a Header object from JSON that contains a serialized Xomega Framework Header.
        public static fromJSON(obj): Header {
            var h: Header = new Header(obj.Type, obj.Id, obj.Text);
            h.defaultFormat = obj.DefaultFormat;
            h.isActive = obj.IsActive;
            // DataContractSerializer returns an array of Key/Value pairs
            if ($.isArray(obj.attributes)) {
                for (var i = 0; i < obj.attributes.length; i++) {
                    h.attr[obj.attributes[i].Key] = obj.attributes[i].Value;
                }
            }
            else h.attr = obj.attributes;
            return h;
        }

        // Returns a string representation of the header based on the specified format.
        // The format string can use the field names in curly braces.
        public toString(fmt: string = this.defaultFormat): string {
            // for performance purposes check standard fields first
            if (fmt === Header.fieldId || !this.isValid) return this.id;
            if (fmt === Header.fieldText) return this.text;
            var hdr = this;

            return fmt.replace(/\[\[|\]\]|\[(i|t|a:)(.*?)\]/g, (m: string, ...n) => {
                if (m === "[[") return "[";
                if (m === "]]") return "]";
                if (n[1] == null || n[1] == "") {
                    if (n[0] === "i") return hdr.id;
                    if (n[0] === "t") return hdr.text;
                }
                else if (n[0] === "a:") {
                    var res: string = "";
                    var attr = hdr.getAttribute(n[1]);
                    if ($.isArray(attr)) {
                        return (<Array<any>>attr).join(", ");
                    }
                    return attr;
                }
                return m;
            });
        }


        // Constructs a deep clone of the current header.
        public clone(): Header {
            var h: Header = new Header(this.type, this.id, this.text);
            return $.extend(true, h, this);
        }

        // Returns a value of the given named attribute.
        public getAttribute(attribute: string) {
            return this.attr[attribute];
        }

        // Sets the attribute value if it has never been set. Otherwise adds a value
        // to the list of values of the given attribute unless it already has such a value.
        // If the current attribute value is not a list, it creates a list and adds it to the list first.
        public addToAttribute(attribute: string, value: any) {
            var curVal = this.attr[attribute];
            if (curVal == null && value != null) {
                this.attr[attribute] = value;
                return;
            }
            if (value == null || value == curVal) return;
            var lst: Array<any>;
            if ($.isArray(curVal)) lst = <Array<any>>curVal;
            else {
                lst = new Array<any>();
                if (curVal != null) lst.push(curVal);
                this.attr[attribute] = lst;
            }
            if (lst.indexOf(value) < 0) lst.push(value);
        }
    }
}