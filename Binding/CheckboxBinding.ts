// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // property binding for a single checkbox
    export class CheckboxBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            return element.tagName.toLowerCase() == "input" && element.type == "checkbox"
                && !property.IsMultiValued;
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            super.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            ko.bindingHandlers.checked.init(element, () => valueAccessor().DisplayStringValue,
                allBindingsAccessor, viewModel, bindingContext);
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).prop("indeterminate", valueAccessor().isNull());
        }
    }
    Bindings.register(new CheckboxBinding());
}