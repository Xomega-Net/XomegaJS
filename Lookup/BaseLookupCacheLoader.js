// Copyright (c) 2014 Xomega.Net. All rights reserved.
var xomega;
(function (xomega) {
    // A base class for the lookup cache loader implementations.
    // It is designed to support cache loaders that either explicitly specify the table types
    // they can load or load all their lookup tables at once during the first time they run,
    // which will determine their supported table types.
    var BaseLookupCacheLoader = (function () {
        // Initializes base parameters of the lookup cache loader.
        function BaseLookupCacheLoader(caseSensitive) {
            var tableTypes = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                tableTypes[_i] = arguments[_i + 1];
            }
            this.caseSensitive = caseSensitive;
            if (tableTypes != null && tableTypes.length > 0) {
                this.supportedTypes = tableTypes;
            }
        }
        // Determines if the given cache type and table type are supported by the current cache loader.
        BaseLookupCacheLoader.prototype.isSupported = function (tableType) {
            return this.supportedTypes == null || this.supportedTypes.indexOf(tableType) >= 0;
        };

        // Loads a lookup table for the specified type into the given lookup cache.
        // Implementation of the corresponding interface method.
        BaseLookupCacheLoader.prototype.load = function (cache, tableType) {
            var _this = this;
            if (!this.isSupported(tableType))
                return;

            this.loadCache(tableType, function (table) {
                cache.cacheLookupTable(table);

                // ensure supportedTypes gets populated
                if (_this.supportedTypes == null)
                    _this.supportedTypes = new Array();
                if (_this.supportedTypes.indexOf(table.type) < 0)
                    _this.supportedTypes.push(table.type);
            });
        };

        // Subroutine implemented by subclasses to perform the actual loading
        // of the lookup table and storing it in the cache using the provided updateCache delegate.
        // The loading process can be either synchronous or asynchronous.
        BaseLookupCacheLoader.prototype.loadCache = function (tableType, updateCache) {
        };
        return BaseLookupCacheLoader;
    })();
    xomega.BaseLookupCacheLoader = BaseLookupCacheLoader;
})(xomega || (xomega = {}));
