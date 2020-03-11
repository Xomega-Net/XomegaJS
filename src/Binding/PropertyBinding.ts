// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // base property binding that all bindings inherit from
    export class PropertyBinding implements KnockoutBindingHandler {

        // this is an abstract base class and should not be used directly on elements
        public appliesTo(element, property): boolean {
            return false;
        }

        // instead of using the standard KO approach of handling all property updates in the update method
        // we explicitly try to subscribe to individual events and handle each one with a separate function,
        // so that property updates wouldn't trigger unrelevant, but expensive operations (e.g. rebuilding selection lists).
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (viewModel instanceof DataRow) {
                // to improve performance we don't subscribe to property changes and don't handle required and validation errors 
                // since the grid should not be directly editable except for selection checkboxes
                this.handleEditable(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                this.handleVisible(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                this.handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            } else {
                ko.computed(function () {
                    this.handleEditable(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                }, this, { disposeWhenNodeIsRemoved: element });
                ko.computed(function () {
                    this.handleVisible(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                }, this, { disposeWhenNodeIsRemoved: element });
                ko.computed(function () {
                    this.handleValidationErrors(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                    }, this, { disposeWhenNodeIsRemoved: element });
                ko.computed(function () {
                    this.handleRequired(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                    }, this, { disposeWhenNodeIsRemoved: element });
                ko.computed(function () {
                    this.handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
                    }, this, { disposeWhenNodeIsRemoved: element });

                this.setLabel(element, valueAccessor);
            }
        }

        // we don't have to do anything here if we subscribe to all updates in the init instead,
        // so this method is here just as a hook to allow subclasses to implement it if needed.
        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        }

        // handle changes in validation errors and udpate the error text and style accordingly
        public handleValidationErrors(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            this.setErrorText(element, valueAccessor().ValidationErrors.ErrorsText());
            ko.bindingHandlers.css.update(element, () => {
                return {
                    invalid: !valueAccessor().isValid(false)
                };
            }, allBindingsAccessor, viewModel, bindingContext);
        }

        // function to set error text for the element that could be overridden in subclasses
        public setErrorText(element, errorText) {
            element.title = errorText;
        }

        // handle changes in Editable and udpate the control's state accordingly
        public handleEditable(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            ko.bindingHandlers.enable.update(element, () => valueAccessor().Editable,
                allBindingsAccessor, viewModel, bindingContext);
        }

        // handle changes in Visible and udpate the control's state accordingly
        public handleVisible(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            ko.bindingHandlers.visible.update(element, () => valueAccessor().Visible,
                allBindingsAccessor, viewModel, bindingContext);
            var label = this.getLabel(element);
            if (label) ko.bindingHandlers.visible.update(label, () => valueAccessor().Visible,
                allBindingsAccessor, viewModel, bindingContext);
        }

        // handle changes in Required and udpate the label accordingly
        public handleRequired(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var label = this.getLabel(element);
            if (label) ko.bindingHandlers.css.update(label, () => {
                return {
                    required: valueAccessor().Required()
                };
            }, allBindingsAccessor, viewModel, bindingContext);
        }

        // handle changes in Value in subclasses
        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        }

        // utility function to get the label for the element
        public getLabel(element) {
            var qry = 'label[for="' + element.id + '"]';
            var label = $(qry);
            if (label.length <= 0)
                label = $(element).closest("label");
            else if (label.length > 1)
                label = $(element).closest(':has(> ' + qry + ')').find(qry);
            return label.length > 0 ? label.get(0) : null;
        }

        public setLabel(element, valueAccessor)
        {
            var label = this.getLabel(element);
            if (label && label.innerText && valueAccessor().Label == null) {
                var text = label.innerText.replace('_', '').trim();
                if (text[text.length - 1] === ':')
                    text = text.substring(0, text.length - 1);
                valueAccessor().Label = text;
            }
        }
    }
}