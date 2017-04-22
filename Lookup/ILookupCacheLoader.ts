// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // An interface for all lookup cache loaders, which can be statically registered with the LookupTable
    // class and called by the framework to populate a given lookup table if it hasn't been loaded yet.
    export interface ILookupCacheLoader {

        // Determines if the given table type is supported by the current cache loader.
        isSupported(tableType: string): boolean;

        // Loads a lookup table for the specified type into the given lookup cache.
        // The implementation should check the cache type and the table type and do nothing
        // if the current lookup cache loader is not applicable for those.
        load(cache: LookupCache, tableType: string);
    }
}