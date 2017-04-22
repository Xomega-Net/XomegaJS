// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // property bindigs registry
    export class Bindings {

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

            // set up binding for sorting grid columns
            ko.bindingHandlers['sortby'] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    let settings = valueAccessor();
                    let list = (settings.list ? settings.list : bindingContext.$data) as DataListObject;
                    let field: ListSortField = new ListSortField(null);
                    if (settings instanceof BaseProperty)
                        field.PropertyName = settings.Name;
                    else if (typeof settings.property === 'string')
                        field.PropertyName = settings.property;
                    else if (settings.property) {
                        field.PropertyName = settings.property.name;
                        if (settings.property.direction)
                            field.SortDirection = settings.property.direction;
                        if (settings.property.nullsFirst)
                            field.NullsFirst = settings.property.nullsFirst;
                    };

                    if (!field.PropertyName) console.warn('Invalid sortby binding: property name must be specified');
                    else if (!(list instanceof DataListObject))
                        console.warn(`Invalid sortby binding for property ${settings.property
                            }: list property or current context should be a DataListObject`);
                    else { // valid settings and list

                        // add click event
                        let onClick = function (ctx, event: JQueryEventObject) {
                            let sc = ko.utils.arrayFirst(list.SortCriteria(), c => c.PropertyName == field.PropertyName);
                            if (sc && event.ctrlKey) list.SortCriteria.remove(sc);
                            else if (event.ctrlKey) list.SortCriteria.push(field);
                            else if (sc) {
                                sc.toggleDirection();
                                list.SortCriteria.notifySubscribers();
                            } else list.SortCriteria([field]);
                        }
                        ko.bindingHandlers.click.init(element, function () { return onClick }, allBindingsAccessor, viewModel, bindingContext);

                        // make clickable and add a sort glyph
                        let el = $(element);
                        el.addClass('sortable');
                        el.append("<i style='display: none' class='sort-glyph fa' aria-hidden='true'/>");

                        // add glyph renderer
                        ko.computed(function () {
                            let glyph = el.children('i');
                            let crit = list.SortCriteria();
                            let sc = ko.utils.arrayFirst(crit, c => c.PropertyName == field.PropertyName);
                            let idx = sc ? crit.indexOf(sc) : -1;
                            for (let i = 0; i < 3; i++) {
                                glyph.toggleClass('sort-' + (i + 1), i == idx);
                            }
                            glyph.attr('style', 'display:' + (sc ? 'inline' : 'none'));
                            if (sc) {
                                glyph.toggleClass('fa-long-arrow-up', sc.SortDirection == ListSortDirection.Ascending);
                                glyph.toggleClass('fa-long-arrow-down', sc.SortDirection == ListSortDirection.Descending);
                            }
                        });
                    }
                }
            };
        }

        // a list of registered property bindings to look through
        private static registered: Array<PropertyBinding> = new Array<PropertyBinding>();

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