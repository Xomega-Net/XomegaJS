// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // An interface for objects that support validation.
    export interface IValidatable {
        // Validates the data object and all its properties and child objects recursively.
        // <param name="force">True to validate regardless of whether or not it has been already validated.</param>
        validate(force: boolean);

        // Gets all validation errors from the data object, all its properties and child objects recursively.
        ValidationErrors: ErrorList;
    }
}