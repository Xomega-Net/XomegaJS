// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // property bindigs registry
    export class Bindings {

        // a list of registered property bindings to look through
        private static registered: Array<PropertyBinding> = new Array<PropertyBinding>();

        // initialize bindings by setting up knockout property binding handler
        public static init() {
            // set up knockout binding that looks up property binding and delegates the work to it
            // only do the init function, which will listen to property changes if/when needed
            // to improve performance, since update is ALWAYS run in a dependentObservable that has its overhead
            ko.bindingHandlers['property'] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var binding: PropertyBinding = Bindings.findBinding(element, valueAccessor());
                    if (binding != null) binding.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                },
            };
        }

        // register a property binding
        public static register(binding: PropertyBinding) {
            Bindings.registered.push(binding);
        }

        // find a property bidning that applies to the given element
        public static findBinding(element, property): PropertyBinding {
            for (var i = Bindings.registered.length - 1; i >= 0; i--)
                if (Bindings.registered[i].appliesTo(element, property))
                    return Bindings.registered[i];
            return null;
        }
    }
}