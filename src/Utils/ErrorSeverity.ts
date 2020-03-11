// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // Error severity possible values.
    export enum ErrorSeverity {
        // Information message that can be displayed to the user.
        Info,

        // A warning that may be displayed to the user for the confirmation before proceeding,
        // if supported by the current execution context.
        Warning,

        // An error, that will be displayed to the user with the other errors. It doesn't stop
        // the execution flow, but prevents the operation from successfully completing.
        Error,

        // A critical error, which stops the execution immediately and returns a fault to the user.
        Critical
    }
}