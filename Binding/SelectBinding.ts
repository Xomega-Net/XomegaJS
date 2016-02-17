// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // property binding for a single or multiple select control
    export class SelectBinding extends PropertyBinding {

        public static DefaultSelectOption: string = "Select...";

        public appliesTo(element, property): boolean {
            return element.tagName.toLowerCase() == "select";
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            super.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            if (valueAccessor().IsMultiValued) {
                element.multiple = true;
                ko.bindingHandlers.selectedOptions.init(element, () => valueAccessor().InternalValue,
                    allBindingsAccessor, viewModel, bindingContext);
            }
            else {
                ko.bindingHandlers.value.init(element, () => valueAccessor().InternalValue,
                    allBindingsAccessor, viewModel, bindingContext);
            }
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var tmpl = '<option value="{0}">{1}</option>';
            // use transport value for equality comparison, since internal value can be an object (e.g. Header)
            var value = valueAccessor().TransportValue();
            $(element).empty();
            if (!valueAccessor().IsMultiValued && (valueAccessor().isNull() || !valueAccessor().Required())) {
                var opt = format(tmpl, "", valueAccessor().Required() ? SelectBinding.DefaultSelectOption :
                    valueAccessor().NullString);
                $(opt).appendTo(element).prop("selected", valueAccessor().isNull());
            }

            var vals = valueAccessor().PossibleValues();
            var tvals = [];
            if (vals != null) {
                ko.utils.arrayForEach(vals, (item) => {
                    var val = valueAccessor().convertValue(item, ValueFormat.Transport);
                    tvals.push(val);
                    var opt = format(tmpl, val, valueAccessor().convertValue(item, ValueFormat.DisplayString));
                    var selected = valueAccessor().IsMultiValued ? value && ko.utils.arrayIndexOf(value, val) >= 0 : val == value;
                    $(opt).appendTo(element).prop("selected", selected);
                });
            }

            if (!valueAccessor().IsMultiValued && !valueAccessor().isNull() && ko.utils.arrayIndexOf(tvals, value) < 0) {
                var opt = xomega.format(tmpl, value, valueAccessor().convertValue(valueAccessor().InternalValue(), ValueFormat.DisplayString));
                $(opt).appendTo(element).prop("selected", true).attr('disabled', 'disabled');
            }
        }
    }
    Bindings.register(new SelectBinding());
}