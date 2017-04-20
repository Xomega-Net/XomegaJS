// Copyright (c) 2014 Xomega.Net. All rights reserved.

/// <reference path="ViewModel.ts"/>

module xomega {

    export abstract class SearchViewModel extends ViewModel {

        // List data object for the view
        public ListObject: DataListObject;

        // An indicator if the search criteria panel is collapsed
        public CriteriaCollapsed: KnockoutObservable<boolean> = ko.observable<boolean>();

        // Controls if criteria panel will automatically collapse/expand on Search/Reset.
        protected get AutoCollapseCriteria(): boolean { return true; }

        /** Activates the search view asynchronously */
        protected activateAsync(params): JQueryPromise<boolean> {
            let vm = this;
            return super.activateAsync(params).then(function (success) {
                if (!success) return false;
                if (vm.ListObject.CriteriaObject)
                    vm.ListObject.CriteriaObject.fromJSON(vm.Params);
                vm.ListObject.RowSelectionMode(vm.Params[ViewParams.SelectionMode]);
                if (vm.Params[ViewParams.Action] === ViewParams.ActionSearch)
                    return vm.search();
                if (vm.Params[ViewParams.Action] === ViewParams.ActionSelect)
                    return vm.searchAsync().then(function (success) {
                        if (!success) return false;
                        return vm.autoSelectAsync();
                    });
                return true;
            });
        }

        public getErrorList(): ErrorList { return this.ListObject ? this.ListObject.ValidationErrors : super.getErrorList(); }

        public getPermalink(): string {
            if (!this.ListObject.CriteriaObject) return null;
            let qry = $.param(this.ListObject.CriteriaObject.toJSON());
            if (this.ListObject.AppliedCriteria()) {
                if (qry) qry += '&';
                qry += `${ViewParams.Action}=${ViewParams.ActionSearch}`;
            }
            if (qry) qry = '?' + qry;
            return qry;
        }

        // Search function exposed as an event handler for the Search button
        public search() {
            let vm = this;
            return this.searchAsync(true).then(function (success) {
                if (success && vm.AutoCollapseCriteria)
                    vm.CriteriaCollapsed(true);
                return success;
            });
        }

        // Resets current view to initial state
        public reset(full: boolean = true) {
            if (this.ListObject)
                this.ListObject.reset();
            if (this.AutoCollapseCriteria)
                this.CriteriaCollapsed(false);
        }

        /** Runs the search asynchronously */
        protected searchAsync(preserveSelection: boolean = true): JQueryPromise<boolean> {
            let vm = this;
            if (vm.ListObject)
                vm.ListObject.validate(true);
            if (vm.ListObject.ValidationErrors.hasErrors())
                return $.Deferred().reject(vm.ListObject.ValidationErrors);
            return vm.ListObject.readAsync({ preserveSelection: preserveSelection });
        }

        /** Runs the search asynchronously if criteria are provided, and auto-selects the result */
        protected autoSelectAsync(preserveSelection: boolean = true): JQueryPromise<boolean> {
            let vm = this;
            if (!vm.ListObject || vm.ListObject.CriteriaObject && !vm.ListObject.CriteriaObject.hasCriteria())
                return $.when(true);

            return vm.searchAsync(false).then(function (success) {
                if (!success) return false;
                let rowCount = vm.ListObject.List().length;
                if (rowCount > 1 && vm.AutoCollapseCriteria)
                    vm.CriteriaCollapsed(true);
                else if (rowCount == 0)
                    vm.CriteriaCollapsed(false);
                else if (rowCount == 1) {
                    vm.ListObject.List()[0]._selected(true);
                    vm.fireViewEvent(new ViewSelectionEvent(vm.ListObject.getSelectedRows()));
                    return false; // single row returned, no need to activate the view
                }
                return true;
            });
        }

        // Select function exposed as an event handler for the Select button
        public select() {
            if (this.ListObject) {
                this.fireViewEvent(new ViewSelectionEvent(this.ListObject.getSelectedRows()));
                this.close();
            }
        }

        // Checks if the view has the Select button visible
        public hasSelect(): boolean {
            return this.Params && this.Params[ViewParams.SelectionMode];
        }

        // Handles child closing or change to refresh the list.
        protected onChildEvent(childViewModel: ViewModel, e: ViewEvent) {
            if (e.isClosed() && this.ListObject) {
                this.ListObject.clearSelectedRows();
            }
            if (e.isSaved() || e.isDeleted()) {
                this.searchAsync(true);
            }
            super.onChildEvent(childViewModel, e);
        }
    }
}