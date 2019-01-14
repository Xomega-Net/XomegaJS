// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    export enum ListSortDirection { Ascending, Descending }

    // A class that represents an individual sort field with a property name and a sort direction.
    export class ListSortField {

        // constructs a new list sort field for the given property
        constructor(property: string) {
            this.PropertyName = property;
        }

        // The property name to sort by.
        public PropertyName: string;

        // The sort direction: ascending or descending.
        public SortDirection: ListSortDirection = ListSortDirection.Ascending;

        // Whether nulls are placed first
        public NullsFirst: boolean = false;

        // Toggles sort direction for the current sort field
        public toggleDirection() {
            this.SortDirection = (this.SortDirection == ListSortDirection.Ascending) ?
                ListSortDirection.Descending : ListSortDirection.Ascending
        }
    }
}