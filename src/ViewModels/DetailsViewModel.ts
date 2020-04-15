// Copyright (c) 2020 Xomega.Net. All rights reserved.

/// <reference path="ViewModel.ts"/>

module xomega {

    export class DetailsViewModel extends ViewModel {

        // The primary data object for the details view.
        public DetailsObject: DataObject;

        /** Activates the details view asynchronously */
        protected activateAsync(params): JQueryPromise<boolean> {
            let vm = this;
            return super.activateAsync(params).then(function (success) {
                if (!success || !vm.DetailsObject) return false;
                if (vm.Params[ViewParams.Action] === ViewParams.ActionCreate) {
                    vm.DetailsObject.reset();
                    vm.DetailsObject.fromJSON(vm.Params);
                    vm.DetailsObject.Modified(false);
                    return true;
                } else {
                    vm.DetailsObject.fromJSON(vm.Params);
                    vm.DetailsObject.Modified(null);
                    return vm.loadDataAsync(false);
                }
            });
        }

        // Override view title for modified and new objects.
        public getViewTitle(): string {
            let title: string = this.getBaseTitle();
            if (this.DetailsObject.IsNew())
                title = 'New ' + title;
            if (this.DetailsObject.Modified())
                title += '*';
            return title;
        }

        public getErrorList(): ErrorList { return this.DetailsObject ? this.DetailsObject.ValidationErrors : super.getErrorList(); }

        // Pops up a confirmation dialog for modified object before closing
        public canClose(): boolean {
            if (!super.canClose()) return false;
            if (this.DetailsObject) {
                if (this.DetailsObject.Modified() && !confirm('Do you want to discard unsaved changes?'))
                    return false;
                this.DetailsObject.Modified(false);
            }
            return true;
        }

        // Pops up a confirmation dialog before deleting
        public canDelete(): boolean {
            if (!this.DetailsObject || this.DetailsObject.IsNew() || !confirm(`Are you sure you want to delete this object?
This operation cannot be undone.`)) return false;
            return true;
        }

        // Handles the save action
        public onSave() {
            if (this.DetailsObject) {
                let vm = this;
                this.DetailsObject.saveAsync().then(() => vm.fireViewEvent(ViewEvent.Saved));
            }
        }

        // Handles the delete action, and closes the view on successful delete
        public onDelete() {
            if (this.canDelete() && this.DetailsObject) {
                let vm = this;
                this.DetailsObject.deleteAsync().then(() => {
                    vm.fireViewEvent(ViewEvent.Deleted);
                    vm.close();
                });
            }
        }

        /**
         * Loads the details view data asynchronously.
         */
        protected loadDataAsync(preserveSelection: boolean): JQueryPromise<boolean> {
            return this.DetailsObject ? this.DetailsObject.readAsync({ preserveSelection: preserveSelection }) : $.when(true);
        }

        // Finds a child list for the child details view and updates its selected rows
        // when the child details view is opened or closed.
        protected updateDetailsSelection(dvm: DetailsViewModel, e: ViewEvent) {
            let keys = this.DetailsObject.Properties.filter(p => p.IsKey);
            let key = keys?.length ? <DataProperty>keys[0] : null;
            let childKeys = dvm.DetailsObject.Properties.filter(p => p.IsKey && p.Name != key?.Name);
            let childKey = childKeys?.length ? <DataProperty>childKeys[0] : null;
            if (!childKey) return;
            for (let prop in this.DetailsObject) {
                let list = this.DetailsObject[prop];
                if (list instanceof DataListObject)
                    this.updateListSelection(list, childKey, e);
            }
        }

        // Default handler for saving or deleting of a child details view.
        protected onChildEvent(childViewModel: ViewModel, e: ViewEvent) {
            if (childViewModel instanceof DetailsViewModel)
                this.updateDetailsSelection(childViewModel, e);
            if (e.isSaved(false) || e.isDeleted(false))
                this.loadDataAsync(true); // reload child lists

            super.onChildEvent(childViewModel, e);
        }
    }
}