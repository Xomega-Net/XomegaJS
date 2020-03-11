// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // An interface for properties and objects that support initialization
    export interface IInitializable {
        // Gets or sets the parent object for the current data object.
        Parent: KnockoutObservable<IDataObject>;

        // Set internal property/object name, which should be unique within its parent object.
        setName(name: string);

        // Performs additional initialization after all other properties and child objects
        // have been already added to the parent object and would be accessible from within this method.
        onInitialized(): void;
    }
}