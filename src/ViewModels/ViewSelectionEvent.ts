// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    export class ViewSelectionEvent extends ViewEvent {

        private selection: Array<DataRow>;

        // Selected data rows.
        public get SelectedRows() { return this.selection; }

        // Constructs a view selection event with the provided selected rows
        public constructor(selectedRows: Array<DataRow>) {
            super(1 << 4);
            this.selection = selectedRows;
        }
    }
}