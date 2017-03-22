// Copyright (c) 2014 Xomega.Net. All rights reserved.

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
                    return vm.loadDataAsync();
                }
            });
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
            if (this.DetailsObject) {
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
        protected loadDataAsync(): JQueryPromise<boolean> {
            return this.DetailsObject ? this.DetailsObject.readAsync() : $.when(true);
        }

        // Default handler for saving or deleting of a child details view.
        protected onChildEvent(childViewModel: ViewModel, e: ViewEvent) {
            if (e.isSaved() || e.isDeleted())
                this.loadDataAsync(); // reload child lists

            super.onChildEvent(childViewModel, e);
        }
    }
}