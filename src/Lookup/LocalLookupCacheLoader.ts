// Copyright (c) 2020 Xomega.Net. All rights reserved.

/// <reference path="BaseLookupCacheLoader.ts"/>
/// <reference path="LookupCache.ts"/>

module xomega {

    // Base class for lookup cache loaders that have a local cache and load it
    // using specified set of input parameters.
    export class LocalLookupCacheLoader extends BaseLookupCacheLoader {

        // The local lookup cache that this cache loader loads.
        private localCache: LookupCache = new LookupCache();

        // A dictionary of named input parameters and their values to load the cache.
        protected parameters: object = {};

        // The specific lookup table that this cache loader populates.
        public TableType: string;

        // Constructs a new local lookup cache loader
        // from the given service provider for the specified type(s).
        public constructor(caseSensitive: boolean, tableType: string) {
            super(caseSensitive, tableType);
            this.TableType = tableType;
            this.localCache.cacheLoaders.push(this);
        }

        // Returns the local cache for this cache loader.
        public getCache(): LookupCache {
            return this.localCache;
        }

        // Sets input parameters for this cache loader
        // and reloads the local cache based on the new parameters.
        public setParameters(parameters: object, onReadyCallback?: (type: string) => void) {
            this.parameters = parameters;
            this.localCache.removeLookupTable(this.TableType);
            this.localCache.getLookupTable(this.TableType, onReadyCallback);
        }
    }
}