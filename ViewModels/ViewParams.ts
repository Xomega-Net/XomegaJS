// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    export class ViewParams {

        // Parameter indicating action to perform
        public static readonly Action: string = '_action';

        // Action to create a new object
        public static readonly ActionCreate: string = 'create';

        // Action to initiate search on activation
        public static readonly ActionSearch: string = 'search';

        // Action to activate for selection
        public static readonly ActionSelect: string = 'select';


        // Query parameter indicating specific source link on the parent that invoked this view
        public static readonly Source: string = '_source';


        // Parameter indicating selection mode to set, if any
        public static readonly SelectionMode: string = '_selection';

        // Single selection mode
        public static readonly SelectionModeSingle: string = DataListObject.SelectionModeSingle;

        // Multiple selection mode
        public static readonly SelectionModeMultiple: string = DataListObject.SelectionModeMultiple;


        // Parameter for view display modes
        public static readonly Mode: string = '_mode';

        // Mode to open views in a popup dialog.
        public static readonly ModePopup: string = 'popup';

        // Mode to open views inline as master-details.
        public static readonly ModeInline: string = 'inline';
    }
}