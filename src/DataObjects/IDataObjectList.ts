// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    // An interface implemented by child or parent data object lists.
    export interface IDataObjectList extends IDataObject {
        // Constructs a new data object of the appropriate type for the data object list.
        // <returns>A new data object of the appropriate type for the data object list.</returns>
        //DataObject NewDataObject();

        // Exports the data from the data object list to the list of data contract objects.
        // <param name="list">The list of data contract objects to export the data to.</param>
        //void ToDataContract(IList list);

        // Gets or sets sort criteria for the data object list.
        //ListSortCriteria SortCriteria { get; set; }

        // Sorts the data object list according to the specified <see cref="SortCriteria"/>.
        //void Sort();

        // Gets or sets a data object that is currently being edited.
        //DataObject EditObject { get; set; }
    }
}