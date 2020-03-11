// Copyright (c) 2020 Xomega.Net. All rights reserved.

module xomega {

    // Implementation of a cache loader that loads the data from the Xomega Framework based
    // lookup cache that is exposed as a RESTful web service.
    export class XomegaCacheLoader implements ILookupCacheLoader {

        public static uriTemplate: string = "lookup-table/{0}";

        // Implements isSupported to return true for any table type.
        public isSupported(tableType: string): boolean {
            return true;
        }

        // Loads the lookup table data
        public load(cache: LookupCache, tableType: string) {
            let req: JQueryAjaxSettings = AuthManager.Current.createAjaxRequest();
            req.url += format(XomegaCacheLoader.uriTemplate, tableType);
            req.success = (data, textStatus, jqXHR) => {
                var tbl: LookupTable;
                if (data == null) {
                    // do nothing if the table is already loaded by another loader
                    if (cache.getLookupTable(tableType)) return;
                    var err: ErrorList = new ErrorList();
                    err.addError(format("Lookup table '{0}' is not found.", tableType));
                    tbl = LookupTable.fromErrors(tableType, err);
                }
                else tbl = LookupTable.fromJSON(data);
                cache.cacheLookupTable(tbl);
            };
            req.error = (jqXHR, textStatus, errorThrow) => {
                // do nothing if the table is already loaded by another loader
                if (cache.getLookupTable(tableType)) return;
                var errLst: ErrorList = new ErrorList();
                errLst.Errors.push(new ErrorMessage(errorThrow, jqXHR.responseText, ErrorSeverity.Error));
                console.error(jqXHR.responseText);
                cache.cacheLookupTable(LookupTable.fromErrors(tableType, errLst));
            };
            $.ajax(req);
        }
    }
    LookupCache.cacheLoaders.push(new XomegaCacheLoader());
}