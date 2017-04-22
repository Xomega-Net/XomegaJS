// Copyright (c) 2017 Xomega.Net. All rights reserved.

/// <reference path="PropertyBinding.ts"/>

module xomega {

    // property binding for an input control with auto suggest, based on HTML5 datalist
    export class AutoSuggestBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            return element.tagName.toLowerCase() == "span" && $(element).hasClass("autosuggest");
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // add input and datalist elements to the span
            var $e = $(element);
            var listId = $e.attr("id") + "-list";
            $("<datalist></datalist>", {"id": listId}).prependTo($e);
            $("<input>", { "list": listId }).prependTo($e);

            // init binding
            super.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            ko.bindingHandlers.value.init($(element).children("input")[0], () => {
                return valueAccessor().Editable() ? valueAccessor().EditStringValue : valueAccessor().DisplayStringValue;
            }, allBindingsAccessor, viewModel, bindingContext);
        }

        public handleValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            ko.bindingHandlers.value.update($(element).children("input")[0], () => {
                return valueAccessor().Editable() ? valueAccessor().EditStringValue : valueAccessor().DisplayStringValue;
            }, allBindingsAccessor, viewModel, bindingContext);

            var vals = valueAccessor().PossibleValues();
            if (vals != null) {
                var dl = $(element).children("datalist")[0];
                var tmpl = '<option value="{0}">';
                ko.utils.arrayForEach(vals, (item) => {
                    var opt = xomega.format(tmpl, valueAccessor().convertValue(item, ValueFormat.EditString));
                    $(opt).appendTo(dl);
                });
            }
        }
    }
    Bindings.register(new AutoSuggestBinding());
}