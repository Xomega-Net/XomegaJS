// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    // Enumeration for different security access levels, which can be associated with properties,
    // data objects or other elements that require security.
    // The access level enumeration constants are listed in the ascending order, so that they can be compared
    // using the standard 'greater than', 'less than' and 'equals' operators.
    export enum AccessLevel {
        // The constant indicating no access to the given element.
        // The user can neither view nor modify the element.
        None,
        // The constant indicating view/read only access to the given element.
        // The user can view the element, but not modify it.
        ReadOnly,
        // The constant indicating full access to the given element.
        // The user can both view and modify the element.
        Full
    }
}