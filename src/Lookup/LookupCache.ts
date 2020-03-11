// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // A class that represents a cache of lookup tables by their types.
    export class LookupCache {

        // Static current instance of the lookup cache.
        public static current: LookupCache = new LookupCache();

        // Static list of registered lookup cache loaders.
        public static cacheLoaders: Array<ILookupCacheLoader> = new Array<ILookupCacheLoader>();

        // A cache of lookup tables by type.
        private cache: any = {};

        // A dictionary by lookup table type of listeners
        // waiting to be notified when the lookup table is loaded.
        private notifyQueues: any = {};

        // A subroutine for loading the lookup table if it's not loaded.
        private loadLookupTable(type: string, onReadyCallback: (type: string) => void) {
            // Protection from queuing up listeners for a table type that is not supported,
            // which will never be notified thereby creating a memory leak.
            if (LookupCache.cacheLoaders.every(cl => !cl.isSupported(type))) {
                delete this.notifyQueues[type];
                return;
            }
            var notify: Array<(type: string) => void> = this.notifyQueues[type];
            if (notify != null) {
                // The table is already being loaded, so just add the listener to the queue to be notified.
                if (onReadyCallback != null && notify.indexOf(onReadyCallback) < 0)
                    notify.push(onReadyCallback);
            }
            else { // Set up the notify queue and start loading.
                notify = new Array<(type: string) => void>();
                if (onReadyCallback != null) notify.push(onReadyCallback);
                this.notifyQueues[type] = notify;
                for (var i = LookupCache.cacheLoaders.length - 1; i >= 0; i--)
                    if (LookupCache.cacheLoaders[i].isSupported(type)) {
                        LookupCache.cacheLoaders[i].load(this, type);
                        return;
                    }
            }
        }

        // Gets a lookup table of the specified type from the cache.
        public getLookupTable(type: string, onReadyCallback?: (type: string) => void): LookupTable {
            if (type == null) return null;

            var tbl: LookupTable = this.cache[type];
            if (tbl == null) {
                this.loadLookupTable(type, onReadyCallback);
                tbl = this.cache[type];
            }
            return tbl;
        }

        // Removes the lookup table of the specified type from the cache.
        // This method can be used to trigger reloading of the lookup table next time it is requested.
        public removeLookupTable(type: string) {
            delete this.cache[type];
            delete this.notifyQueues[type];
        }

        // Stores the given lookup table in the current cache under the table's type.
        // The lookup table and its type should not be null.
        public cacheLookupTable(table: LookupTable) {
            if (table == null || table.type == null) return;
            this.cache[table.type] = table;
            var notify: Array<(type: string) => void> = this.notifyQueues[table.type];
            if (notify != null) {
                for (var i = 0; i < notify.length; i++)
                    notify[i](table.type);
            }
            delete this.notifyQueues[table.type];
        }
    }
}