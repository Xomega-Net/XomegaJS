// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // The base class for all Xomega properties that defines various additional meta-information
    // that can be associated with a piece of data, such as description, editability, visibility,
    // security, whether or not it is required, etc. It also provides support for notification
    // of any changes in this type of information.
    // Xomega properties are typically added to Xomega data objects that can serve as a data model
    // for user interface screens.
    export class BaseProperty implements IInitializable {

        // An internal flag to allow manually making the property uneditable.
        // The default value is true.
        private editable: KnockoutObservable<boolean> = ko.observable<boolean>(true);

        // A internal flag to allow manually making the property invisible.
        // The default value is true.
        private visible: KnockoutObservable<boolean> = ko.observable<boolean>(true);

        // A internal flag that keeps track of whether or not the property is required.
        // The default value is false.
        private required: KnockoutObservable<boolean> = ko.observable<boolean>(false);

        // The parent data object of the property if any. In rare cases the parent can be set to null
        // and therefore should be always checked for null.
        public Parent: KnockoutObservable<DataObject> = ko.observable<DataObject>();

        // A flag indicating if this a key property within its parent data object
        public IsKey: boolean;

        // Constructs a base property
        constructor() {
            // initialize computed observables in the constructor after the parent is set
            this.Editable = ko.computed({
                read: () => {
                    var al: number = this.AccessLevel();
                    return this.editable()
                        && (this.Parent() == null || this.Parent().isPropertyEditable(this))
                        && (al > AccessLevel.ReadOnly);
                },
                write: (value: boolean) => { this.editable(value); },
                owner: this
            });

            this.Visible = ko.computed({
                read: () => {
                    var al: number = this.AccessLevel();
                    return this.visible()
                        && (this.Parent() == null || this.Parent().isPropertyVisible(this))
                        && (al > AccessLevel.None);
                },
                write: (value: boolean) => { this.visible(value); },
                owner: this
            });

            this.Required = ko.computed({
                read: () => {
                    return this.required() && this.Editable() && this.Visible()
                        && (this.Parent() == null || this.Parent().isPropertyVisible(this));
                },
                write: (value: boolean) => { this.required(value); },
                owner: this
            });
        }

        // Performs additional property initialization after all other properties and child objects
        // have been already added to the parent object and would be accessible from within this method.
        public onInitialized() {
            // the subclasses can implement the additional initialization
        }

        // implementation of the IInitializable
        public setName(name: string) {
            this.Name = name;
        }

        // Internal property name, which should be unique within its parent object.
        public Name: string;

        // User-friendly property label that can be used in error messages and other places
        // to identify the property for the user.
        public Label: string;

        // Returns the current access level for the property.
        // Allows setting a new access level and fires a property change event
        // for property editability and visibility, since they both depend on the security access level.
        public AccessLevel: KnockoutObservable<AccessLevel> = ko.observable<AccessLevel>(AccessLevel.Full);

        // Returns a value indicating whether or not the property is editable.
        // This value is calculated based on the internal value of the editable field,
        // the result of the call delegated to the parent object to determine this property's editability
        // and the value of the security access level. Controls bound to this property
        // should update their editability based on this value.
        // Setting this value updates the internal editable flag and fires the property change event if necessary.
        public Editable: KnockoutObservable<boolean>;

        // Returns a value indicating whether or not the property is visible.
        // This value is calculated based on the internal value of the visible field,
        // the result of the call delegated to the parent object to determine this property's visibility
        // and the value of the security access level. Controls bound to this property
        // should update their visibility based on this value.
        // Setting this value updates the internal visible flag and fires the property change event if necessary.
        public Visible: KnockoutObservable<boolean>;

        // Returns a value indicating whether or not the property is required.
        // This value is calculated based on the internal value of the required field and
        // the result of the call delegated to the parent object to determine if this property is required.
        // Setting this value updates the internal required flag and fires the property change event if necessary.
        public Required: KnockoutObservable<boolean>;

        // Returns a user-friendly string representation of the property.
        public toString(): string {
            if (this.Label != null) return this.Label;
            // convert Pascal case to words
            var res = this.Name.replace(/([a-z])([A-Z])/, "$1 $2");
            res = res.replace(/([A-Z][A-Z])([A-Z])([a-z])/, "$1 $2$3");
            return res;
        }
    }
}