// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // property binding for a single or multiple select control
    export class AutoSuggestBinding extends PropertyBinding {

        public appliesTo(element, property): boolean {
            if (element.tagName.toLowerCase() != "span") return false;
            var $dl = $(element).children("datalist");
            var $in = $(element).children("input");
            return $dl.length == 1 && $in.length == 1 && (<any>$in[0]).type == "text";
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
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