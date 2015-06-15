// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // property binding for input text controls
    export class InputTextBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            return element.tagName.toLowerCase() == "textarea" ||
                element.tagName.toLowerCase() == "input" && element.type == "text";
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            super.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            ko.bindingHandlers.value.init(element, () => {
                return valueAccessor().Editable() ?
                    valueAccessor().EditStringValue : valueAccessor().DisplayStringValue;
            }, allBindingsAccessor, viewModel, bindingContext);
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            ko.bindingHandlers.value.update(element, () => {
                return valueAccessor().Editable() ?
                    valueAccessor().EditStringValue : valueAccessor().DisplayStringValue;
            }, allBindingsAccessor, viewModel, bindingContext);
        }
    }
    Bindings.register(new InputTextBinding());
}