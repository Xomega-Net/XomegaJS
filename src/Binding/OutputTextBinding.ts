// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    // property binding for readonly output text only
    export class OutputTextBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            return true;
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // if the viewModel is a DataRow, i.e. we are binding a list, then bind directly to the value
            // instead of the observable object to improve performance.
            // As a result, data rows should be replaced in the list instead of updating their values in code
            ko.bindingHandlers.text.update(element, () => viewModel instanceof DataRow ?
                    valueAccessor().resolveValue(viewModel[valueAccessor().Name], ValueFormat.DisplayString) : valueAccessor().DisplayStringValue,
                allBindingsAccessor, viewModel, bindingContext);
        }
    }
    Bindings.register(new OutputTextBinding());
}