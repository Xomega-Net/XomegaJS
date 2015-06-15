
module xomega {

    // declare standard variables for 3rd party libs
    declare var ko: KnockoutStatic;
    declare var $: JQueryStatic;
    declare var moment: moment.MomentStatic;

    // initialize xomega based on the 3rd party libs
    export function init(knockout: KnockoutStatic, jQuery: JQueryStatic, momentjs: moment.MomentStatic) {
        ko = knockout;
        $ = jQuery;
        moment = momentjs;

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

if (typeof module === "object" && module.exports) {
    // CommonJS (Node)
    module.exports = xomega;
} else if (typeof define === "function" && define['amd']) {
    // AMD
    define(["knockout", "jquery", "moment"], function (knockout, jquery, momentjs) {
        xomega.init(knockout, jquery, momentjs);
        return xomega;
    });
}