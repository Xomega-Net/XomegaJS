// Copyright (c) 2019 Xomega.Net. All rights reserved.

/// <reference path="OutputTextBinding.ts"/>
//  ^^^ Above reference is needed to register the OutputTextBinding first

module xomega {

    // property binding for a list of checkboxes or radio buttons
    export class OptionsBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            return element.dataset.control == "options";
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var tmpl = '<div><label><input type="{0}" name="{1}" value="{2}"/>{3}</label></div>';
            var type = valueAccessor().IsMultiValued ? "checkbox" : "radio";
            var name = element.dataset.name;
            // use transport value for equality comparison, since internal value can be an object (e.g. Header)
            var value = valueAccessor().TransportValue();
            $(element).empty();
            if (!valueAccessor().IsMultiValued && !valueAccessor().Required()) {
                var opt = format(tmpl, type, name, "", valueAccessor().NullString);
                $(opt).appendTo(element).find("input").click(updateModel).prop("checked", valueAccessor().isNull());
            }
            var vals = valueAccessor().PossibleValues();
            if (vals != null) {
                ko.utils.arrayForEach(valueAccessor().PossibleValues(), (item) => {
                    var val = valueAccessor().convertValue(item, ValueFormat.Transport);
                    var opt = format(tmpl, type, name, val, valueAccessor().convertValue(item, ValueFormat.DisplayString));
                    var checked = valueAccessor().IsMultiValued ? value && ko.utils.arrayIndexOf(value, val) >= 0 : val == value;
                    $(opt).appendTo(element).find("input").click(updateModel).prop("checked", checked);
                });
            }

            function updateModel(evt) {
                if (valueAccessor().IsMultiValued) {
                    var arr: Array<any> = valueAccessor().TransportValue() || [];
                    var koUtils: any = ko.utils; // since ko.utils.addOrRemoveItem is not 'definitely typed' yet
                    koUtils.addOrRemoveItem(arr, evt.target.value, evt.target.checked);
                    valueAccessor().InternalValue(arr);
                }
                else valueAccessor().InternalValue(evt.target.value);
            }
        }
    }
    Bindings.register(new OptionsBinding());
}