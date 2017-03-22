// Copyright (c) 2014 Xomega.Net. All rights reserved.

/// <reference path="PropertyBinding.ts"/>

module xomega {

    // property binding for a single checkbox
    export class CheckboxBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            return element.tagName.toLowerCase() == "input" && element.type == "checkbox"
                && !property.IsMultiValued;
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            super.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            $(element).click(function () {
                if (valueAccessor().isNull()) valueAccessor().InternalValue(false);
                else if (!valueAccessor().InternalValue()) valueAccessor().InternalValue(true);
                else valueAccessor().InternalValue(valueAccessor().Required() ? false : null);
            });
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).prop("indeterminate", valueAccessor().isNull());
            element.checked = valueAccessor().InternalValue() ? true : false;
        }
    }
    Bindings.register(new CheckboxBinding());
}