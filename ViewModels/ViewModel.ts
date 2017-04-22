// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    export class ViewModel {

        // Parameters the view model was last activated with
        private _params;

        // Retirns parameters the view model was last activated with
        public get Params() { return this._params; }

        // Activates the view model
        protected activateAsync(params): JQueryPromise<boolean> {
            this._params = params || {};
            this.ActiveChildView(null); // reset active child
            return $.when(true);
        }

        // implements Durandal lifecycle function to activate the view model if needed
        public canActivate(): JQueryPromise<boolean> {
            // activation parameters will be from the query, which is the last argument
            return this.activateAsync(arguments.length > 0 ? arguments[arguments.length - 1] : null);
        }

        // implements Durandal lifecycle function to activate the view model if needed
        public canDeactivate(): JQueryPromise<boolean> {
            return $.when(this.canClose());
        }

        private errorList: ErrorList = new ErrorList();

        public getErrorList(): ErrorList { return this.errorList; }

        // observable current active child view
        public ActiveChildView: KnockoutObservable<ViewModel> = ko.observable<ViewModel>();

        // navigate to a child view asynchrounously
        public navigateTo(childViewName: string, activationParams): JQueryPromise<boolean> {
            let vm = this;ko
            return this.acquireView(childViewName).then(function (view) {
                let res: JQueryPromise<boolean>;
                // check if active view exists and can be reused
                if (vm.ActiveChildView() && vm.ActiveChildView().canReuseView(view)) {
                    if (vm.ActiveChildView().sameParams(activationParams))
                        return $.when(false); // same params, keep the current view
                    else view = vm.ActiveChildView(); // reuse the current view
                } else vm.subscribeToChildEvents(view);

                let canDeactivate = vm.ActiveChildView() ? vm.ActiveChildView().canDeactivate() : $.when(true);

                return canDeactivate.then(function (success) {
                    if (!success) return false;
                    return view.activateAsync(activationParams).then(function (success) {
                        if (!success) return false;
                        if (view !== vm.ActiveChildView())
                            vm.ActiveChildView(view);
                        return true;
                    });
                });
            }).fail(function (err, msg) {
                if (vm.getErrorList()) vm.getErrorList().mergeWith(ErrorList.fromErrorResponse(err, msg));
            });
        }

        protected acquireView(viewName: string): JQueryPromise<ViewModel> {
            return $.Deferred(function (dfd) {
                require([viewName], function (mod) {
                    let view: ViewModel = null;
                    if ($.isFunction(mod)) {
                        view = new mod();
                        if (view instanceof ViewModel) dfd.resolve(view);
                        else dfd.reject(`View '${viewName}' should be an instance of ViewModel`);
                    } else dfd.reject(`View '${viewName}' should be a constructor function`);
                }, function (err) { dfd.reject(err); });
            }).promise();
        }

        // Checks if we can reuse the current view if they are of the same type. Can be overridden in subclasses
        protected canReuseView(view: ViewModel): boolean {
            return view && this.constructor === view.constructor;
        }

        // Checks if activation parameters are the same as in this view. Can be overridden in subclasses
        protected sameParams(activationParams): boolean {
            return $.param(this.Params) === $.param(activationParams);
        }

        // Checks if the view can be closed.
        protected canClose(): boolean {
            return this.ActiveChildView() ? this.ActiveChildView().canClose() : true;
        }

        // Checks if the view has the Close button visible
        protected hasClose(): boolean {
            // display Close button only if the view is activated as a child (popup or inline)
            return this.Params && this.Params[ViewParams.Mode];
        }

        // Close the view by firing a closed event
        public close() {
            if (this.canClose())
                this.fireViewEvent(ViewEvent.Closed);
        }

        // callbacks for view events
        private ViewEvents: JQueryCallback = $.Callbacks();

        // Adds a listener to the view events
        public onViewEvent(callback: (view: ViewModel, event: ViewEvent) => void) {
            this.ViewEvents.add(callback);
        }

        // Fires the specified view event
        public fireViewEvent(event: ViewEvent, source: ViewModel = this) {
            this.ViewEvents.fire(source, event);
        }

        // Subscribes to child view's events
        public subscribeToChildEvents(child: ViewModel) {
            if (child) {
                let vm = this;
                child.onViewEvent((view, event) => vm.onChildEvent(view, event));
            }
        }

        // Default handler for child events, which just re-publishes them.
        protected onChildEvent(childViewModel: ViewModel, e: ViewEvent) {
            this.fireViewEvent(e.with(ViewEvent.Child), childViewModel);

            if (e.isClosed() && childViewModel === this.ActiveChildView())
                this.ActiveChildView(null);
        }
   }
}