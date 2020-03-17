// Copyright (c) 2020 Xomega.Net. All rights reserved.

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

    // simple utility function to convert a string to CamelCase
    export function toCamelCase(str: string) {
        return str.replace(/(^| |\.|-|_|\/)(.)/g, function (match, g1, g2) {
            return g2.toUpperCase();
        });
    }

    // populates initialized object from the specified JSON with different member casing
    export function fromJSON(obj: Object, json: Object) {
        for (var prop in json) {
            if (!json.hasOwnProperty(prop)) continue;
            let ccProp = toCamelCase(prop);
            let val = json[prop];
            if ($.isArray(val)) {
                let arr = null;
                if ($.isArray(obj[ccProp])) arr = obj[ccProp];
                else if ($.isArray(obj[prop])) arr = obj[prop];
                if (val.length && arr && arr.length && arr[0]) {
                    for (var i = 0; i < val.length; i++) {
                        if (i < val.length - 1)
                            arr[i + 1] = $.extend(true, {}, arr[i]);
                        fromJSON(arr[i], val[i]);
                    }
                } else obj[prop] = val;
            } else if (typeof val === 'object') {
                if (obj[ccProp]) fromJSON(obj[ccProp], val);
                else if (obj[prop]) fromJSON(obj[prop], val);
                else obj[prop] = val;
            } else if (obj.hasOwnProperty(ccProp))
                obj[ccProp] = val;
            else obj[prop] = val;
        }
    }

    // turns the given value into an observable using specified default value
    export function makeObservable(val, def): KnockoutObservable<any> {
        return ko.isObservable(val) ? val : ko.observable(val || def);
    }
}