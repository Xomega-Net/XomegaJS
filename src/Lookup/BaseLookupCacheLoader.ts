// Copyright (c) 2020 Xomega.Net. All rights reserved.

/// <reference path="ILookupCacheLoader.ts"/>
/// <reference path="LookupCache.ts"/>
/// <reference path="LookupTable.ts"/>

module xomega {

    // A base class for the lookup cache loader implementations.
    // It is designed to support cache loaders that either explicitly specify the table types
    // they can load or load all their lookup tables at once during the first time they run,
    // which will determine their supported table types.
    export class BaseLookupCacheLoader implements ILookupCacheLoader {

        // The list of supported table types, which is either
        // specified initially or constructed from the first run.
        private supportedTypes: Array<string>;

        // Indicates whether or not the loaded lookup tables should be case sensitive.
        public caseSensitive: boolean;

        // Initializes base parameters of the lookup cache loader.
        public constructor(caseSensitive: boolean, ...tableTypes: Array<string>) {
            this.caseSensitive = caseSensitive;
            if (tableTypes != null && tableTypes.length > 0) {
                this.supportedTypes = tableTypes;
            }
        }

        // Determines if the given cache type and table type are supported by the current cache loader.
        public isSupported(tableType: string): boolean {
            return this.supportedTypes == null || this.supportedTypes.indexOf(tableType) >= 0;
        }

        // Loads a lookup table for the specified type into the given lookup cache.
        // Implementation of the corresponding interface method.
        public load(cache: LookupCache, tableType: string) {
            if (!this.isSupported(tableType)) return;

            this.loadCache(tableType, (table: LookupTable) => {
                // do nothing if the table is already loaded by another loader
                if (cache.getLookupTable(tableType)) return;
                cache.cacheLookupTable(table);
                // ensure supportedTypes gets populated
                if (this.supportedTypes == null) this.supportedTypes = new Array<string>();
                if (this.supportedTypes.indexOf(table.type) < 0) this.supportedTypes.push(table.type);
            });
        }

        // Subroutine implemented by subclasses to perform the actual loading
        // of the lookup table and storing it in the cache using the provided updateCache delegate.
        // The loading process can be either synchronous or asynchronous.
        public loadCache(tableType: string, updateCache: (table: LookupTable) => void) {
        }
    }
}