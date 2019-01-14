// Copyright (c) 2019 Xomega.Net. All rights reserved.

/// <reference path="OutputTextBinding.ts"/>
//  ^^^ Above reference is needed to register the OutputTextBinding first

module xomega {
    declare var controls: any;

    // property binding for input text controls
    export class InputTextBinding extends PropertyBinding {

        public static inputTypes: Array<string> = ['text', 'password', 'email', 'tel', 'url'];

        public appliesTo(element, _property): boolean {
            return element.tagName.toLowerCase() == "textarea" ||
                element.tagName.toLowerCase() == "input" && InputTextBinding.inputTypes.indexOf(element.type) >= 0;
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            super.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            ko.bindingHandlers.value.init(element, () => {
                return valueAccessor().Editable() ?
                    valueAccessor().EditStringValue : valueAccessor().DisplayStringValue;
            }, allBindingsAccessor, viewModel, bindingContext);


            if (controls) {
                let el = $(element);
                if (typeof (controls.datePicker) === 'function' && valueAccessor() instanceof DateTimeProperty
                        && (el.hasClass('date') || el.hasClass('datetime'))) {
                    let dtp: DateTimeProperty = valueAccessor();
                    controls.datePicker(el, dtp.EditFormat);
                }
                if (typeof (controls.autoComplete) === 'function' && valueAccessor() instanceof EnumProperty) {
                    controls.autoComplete(el, valueAccessor());
                }
            }
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