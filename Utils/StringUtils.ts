// Copyright (c) 2014 Xomega.Net. All rights reserved.

module xomega {

    // Format string using specified positional parameters
    export function format(str, ...params) {
        var p = getParams(params);
        return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
            if (m == "{{") { return "{"; }
            if (m == "}}") { return "}"; }
            return p[n];
        });
    }

    // Extract an array of parameters from the given array to account for cases when parameters
    // are passed as an array to another method that expects them to be passed as individual values
    export function getParams(params: Array<any>) {
        return (params && params.length == 1 && $.isArray(params[0])) ? getParams(params[0]) : params;
    }

    // simple utility function to extract a URL parameter
    export function urlParam(url: string, param) {
        if (param = (new RegExp('[?&]' + encodeURIComponent(param) + '=([^&]*)')).exec(url))
            return decodeURIComponent(param[1]);
    }


    // simple utility function to convert a string to CamelCase
    export function toCamelCase(str: string) {
        return str.replace(/(^| |\.|-|_|\/)(.)/g, function (match, g1, g2) {
            return g2.toUpperCase();
        });
    }
}