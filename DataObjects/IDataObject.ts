// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // Data object interface to be implemented by the parent object
    // or all child objects of any data object.
    // Both <c>DataObject</c> and <c>DataObjectList</c> implement this interface.
    export interface IDataObject extends IValidatable, IInitializable, IModifiable {

        // Returns if the current object is editable, which may be based on several factors.
        // Allows making the object non-editable by setting this field to true.
        Editable: KnockoutObservable<boolean>;

        // Allows controlling property editability on the data object level.
        // <param name="p">The property to check the editability of.</param>
        // <returns>True if the property should be editable, false otherwise.</returns>
        isPropertyEditable(p: BaseProperty): boolean;

        // Allows controlling if the property is required on the data object level.
        // <param name="p">The property being checked if it's required.</param>
        // <returns>True if the property should be required, false otherwise.</returns>
        isPropertyRequired(p: BaseProperty): boolean;

        // Allows controlling property visibility on the data object level.
        // <param name="p">The property to check the visibility of.</param>
        // <returns>True if the property should be visible, false otherwise.</returns>
        isPropertyVisible(p: BaseProperty): boolean;
    }
}