// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    export class ViewEvent {

        // A static constant representing a combination of all events.
        public static All: ViewEvent = new ViewEvent(0xFFFF);

        // A static constant representing a Closed event
        public static Closed: ViewEvent = new ViewEvent(1 << 0);

        // A static constant representing a Saved event
        public static Saved: ViewEvent = new ViewEvent(1 << 1);

        // A static constant representing a Deleted event
        public static Deleted: ViewEvent = new ViewEvent(1 << 2);

        // A static constant representing a Child view event
        public static Child: ViewEvent = new ViewEvent(1 << 3);

        private events: number;

        // Constructs a view event from the provided flags
        protected constructor(events: number) {
            this.events = events;
        }

        // Returns an event that is this event with the provided event added
        public with(viewEvent: ViewEvent): ViewEvent { return new ViewEvent(this.events | viewEvent.events); }

        // Returns an event that is this event with the provided event removed
        public without(viewEvent: ViewEvent): ViewEvent { return new ViewEvent(this.events & ~viewEvent.events); }

        // Returns if the view was closed.
        public isClosed(self: boolean = true): boolean {
            return (self && !this.isChild() || !self) && (this.events & ViewEvent.Closed.events) > 0;
        }

        // Returns if the view was saved.
        public isSaved(self: boolean = true): boolean {
            return (self && !this.isChild() || !self) && (this.events & ViewEvent.Saved.events) > 0;
        }

        // Returns if the view was closed.
        public isDeleted(self: boolean = true): boolean {
            return (self && !this.isChild() || !self) && (this.events & ViewEvent.Deleted.events) > 0;
        }

        // Returns if a child view event occured.
        public isChild(): boolean { return (this.events & ViewEvent.Child.events) > 0; }
    }
}