// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    export class AuthManager {

        // The root URL for web API
        public static ApiRoot = '/';

        // The current authentication manager
        public static _current: AuthManager;

        // Static getter for the current authentication manager
        public static get Current(): AuthManager
        {
            if (!AuthManager._current) AuthManager._current = new AuthManager();
            return AuthManager._current;
        }
        // Static setter for the current authentication manager
        public static set Current(value: AuthManager) { AuthManager._current = value; }

        // The key to use for storing access token
        public static AccessTokenKey: string = 'access_token';

        // The path (route) to the login view
        public static LoginPath: string = 'login';

        // Query parameter for the return URL after the login
        public static ReturnParam: string = 'return';

        // Getter for the locally stored access token
        protected get accessToken(): string { return sessionStorage.getItem(AuthManager.AccessTokenKey); }

        // Setter for the locally stored access token
        protected set accessToken(value: string) {
            if (value) sessionStorage.setItem(AuthManager.AccessTokenKey, value);
            else sessionStorage.removeItem(AuthManager.AccessTokenKey);
        }

        // Observable flag indicating if the user is logged in
        public LoggedIn: KnockoutObservable<boolean> = ko.observable(false);

        // Security claims for the current user
        public Claims: any;

        // Signs in the current user with the specified security token and claims
        public signIn(token: string, claims) {
            this.accessToken = token;
            this.Claims = claims;
            this.LoggedIn(true);
        }

        // Signs the current user out
        public signOut() {
            this.accessToken = null;
            this.Claims = null;
            this.LoggedIn(false);
        }

        // Constructs or enhances provided headers with a proper Authorization header.
        public getHeaders(headers) {
            let res = headers || {};
            let accessToken = this.accessToken;
            if (accessToken) {
                res.Authorization = 'Bearer ' + accessToken;
            }
            return res;
        }

        public createAjaxRequest(): JQueryAjaxSettings {
            let req: JQueryAjaxSettings = {};
            req.url = AuthManager.ApiRoot;
            req.contentType = 'application/json';
            req.headers = this.getHeaders(null);
            return req;
        }

        // Handles Unathorized (401) server response (e.g. due to an expired token) by signing the user out
        public handleUnauthorizedResponse() {
            let aMgr = this;
            $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
                if (jqxhr.status == 401) aMgr.signOut();
            });
        }

        // Build loging URL for the current routing instruction
        public getLoginUrl(instruction): string {
            let returnUrl = instruction.fragment;
            if (instruction.queryString)
                returnUrl += '?' + instruction.queryString;
            return AuthManager.LoginPath + '?' + AuthManager.ReturnParam + '=' + encodeURIComponent(returnUrl);
        }

        // Perform a role based security check for a specified route configuration
        public isRouteAllowed(routeCfg: any): boolean {
            if (this.LoggedIn()) {
                if (Array.isArray(routeCfg.roles) && this.Claims.role)
                    return routeCfg.roles.indexOf(this.Claims.role) >= 0;
                return true;
            }
            return routeCfg.allowAnonymous;
        }

        // Secures routing by checking if the user is logged in and the route is allowed.
        public static guardRoute(instance, instruction): any {
            let aMgr = AuthManager.Current;
            if (aMgr.LoggedIn())
                return aMgr.isRouteAllowed(instruction.config);
            else if (instruction.config.route == AuthManager.LoginPath) return true;
            else return aMgr.getLoginUrl(instruction);
        }

        // Utility function to process menu items (routes) recursively
        public static forEachItem(item: any, func: Function, ctx) {
            if (!item) return;
            if (Array.isArray(item)) {
                item.forEach(function (i) { AuthManager.forEachItem(i, func, ctx); }, ctx);
            } else {
                // process children first, to handle parents' dependencies on children
                this.forEachItem(item.items, func, ctx);
                $.proxy(func, ctx)(item);
            }
        }

        // Sets up an allowed computed for the given menu item to control its visibility.
        // The parent item is not allowed if none of its children are allowed.
        public setUpAllowed(item) {
            if (item.route != null) {
                item.allowed = ko.computed(function () { return this.isRouteAllowed(item); }, this);
            } else {
                item.allowed = ko.computed(function () {
                    return !Array.isArray(item.items) || item.items.some(function (i) { return i.allowed(); });
                }, this);
            }
        }

    }

}