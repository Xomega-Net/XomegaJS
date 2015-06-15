// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // An interface for properties and data objects that support modification control
    export interface IModifiable {
        // Gets or sets the modification state of the property. Null means the property value has never been set.
        // False means the value has been set only once (initialized).
        // True means that the value has been modified since it was initialized.
        Modified: KnockoutObservable<boolean>;
    }
}