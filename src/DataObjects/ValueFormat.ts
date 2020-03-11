// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // Enumeration that represents different formats that data property values can be converted to.
    export enum ValueFormat {

        // The format in which values are stored internally in data properties.
        // The format is typically typed, that is an integer would be stored as an <c>int</c>.
        // Whenever a value is set on a data property, it will always try to convert it 
        // to the internal format first. If it fails to convert it, it may store it as is.
        // For multivalued data properties, each value in the list will be converted to an internal format.
        Internal,

        // The format in which data property values are transported between layers
        // during a service call. The format is typically typed and may or may not be
        // the same as the internal format. For example, we may want to store a resolved
        // <c>Header</c> object internally, but send only the ID part in a service call.
        Transport,

        // The string format in which the user inputs the value. It may or may not be the same
        // as the format in which the value is displayed to the user when it's not editable.
        EditString,

        // The string format in which the value is displayed to the user when it's not editable.
        // When internal value is an object such as <c>Header</c>, the display string may
        // consist of a combination of several of its parts.
        DisplayString
    }
}