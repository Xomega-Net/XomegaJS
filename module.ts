// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // declare standard variables for 3rd party libs
    declare var ko: KnockoutStatic;
    declare var $: JQueryStatic;
    declare var moment: moment.MomentStatic;
    declare var controls: any;

    // initialize xomega based on the 3rd party libs
    export function init(knockout: KnockoutStatic, jQuery: JQueryStatic, momentjs: moment.MomentStatic, xomegaControls) {
        ko = knockout;
        $ = jQuery;
        moment = momentjs;
        controls = xomegaControls;

        Bindings.init();
    }
}

// declare a named module for typescript imports
declare module 'xomega'
{
    export = xomega
}

// Set up the module for either CommonJS or AMD.
// This requires that this file is compiled last

declare var module;
declare var define: RequireDefine;

if (typeof module === 'object' && module.exports) {
    // CommonJS (Node)
    module.exports = xomega;
} else if (typeof define === 'function' && define['amd']) {
    // AMD
    define(['knockout', 'jquery', 'moment', 'xomega-controls'], function (knockout, jquery, momentjs, xomegaControls) {
        xomega.init(knockout, jquery, momentjs, xomegaControls);
        return xomega;
    });
}