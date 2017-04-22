// Copyright (c) 2017 Xomega.Net. All rights reserved.

module xomega {

    // A list of error messages and utility methods to manipulate them.
    export class ErrorList {

        // Retrieves the error list from the specified exception if possible,
        // otherwise constructs a new error list with the exception as the error message.
        // <param name="ex">Exception to retrieve the error list from.</param>
        // <returns>An error list retrieved from the exception.</returns>
        public static fromError(err: Error): ErrorList {
            let errList = new ErrorList();
            let errors: ErrorMessage[] = err["__errors__"];
            if (errors !== null) errList.Errors(errors);
            else errList.addError(err.name, err.message);
            return errList;
        }

        // Deserializes an ErrorList object from JSON that contains a serialized Xomega Framework ErrorList.
        public static fromJSON(obj): ErrorList {
            var data: Array<ErrorMessage> = obj.Errors.map((val, idx, arr) => ErrorMessage.fromJSON(val));
            var lst: ErrorList = new ErrorList();
            ko.utils.arrayPushAll<ErrorMessage>(lst.Errors, data);
            return lst;
        }

        // Constructs an ErrorList object from an error response to a jQuery AJAX request.
        public static fromErrorResponse(xhr, errorThrow): ErrorList {
            if (xhr instanceof ErrorList) return xhr;
            if ($.type(xhr) === 'error') return ErrorList.fromError(xhr);
            var json = xhr.responseJSON;
            if (json && json.Errors) return ErrorList.fromJSON(json);
            var errLst: ErrorList = new ErrorList();
            if (errLst.fromExceptionJSON(json)) return errLst;
            if (errLst.fromOAuthError(json)) return errLst;
            errLst.Errors.push(new ErrorMessage(errorThrow, json && json.Message ? json.Message : (xhr.responseText ? xhr.responseText : errorThrow), ErrorSeverity.Error));
            return errLst;
        }

        // Populates the current error list from the exception JSON returned by the server.
        public fromExceptionJSON(json): boolean {
            if (json && json.ExceptionType) {
                this.Errors.push(new ErrorMessage(json.ExceptionType, json.ExceptionMessage, ErrorSeverity.Error));
                if (json.InnerException) this.fromExceptionJSON(json.InnerException);
                return true;
            }
            return false;
        }

        // Populates the current error list from an OAuth error JSON returned by the server.
        public fromOAuthError(json): boolean {
            if (json && json.error && json.error_description) {
                this.Errors.push(new ErrorMessage(json.error, json.error_description, ErrorSeverity.Error));
                return true;
            }
            return false;
        }

        // Internal list of error messages.
        public Errors: KnockoutObservableArray<ErrorMessage>;

        //  A combined error text by concatenating all error messages with a new line delimiter.
        public ErrorsText: KnockoutObservable<string>;

        // constructs a new error list object
        public constructor() {
            this.Errors = ko.observableArray<ErrorMessage>();
            this.ErrorsText = ko.computed(() => {
                return this.Errors().map((err) => { return err.Message; }).join("\n");
            }, this);
        }

        // Gets the text message based on the given error code and parameters.
        private getMessage(code: string, ...params): string {
            return format(code, params);
        }

        // Adds an error to the list with the given error code and additional parameters to substitute.
        public addError(code: string, ...params) {
            this.Errors.push(new ErrorMessage(code, this.getMessage(code, params), ErrorSeverity.Error));
        }

        // Adds an error to the list with the given error code and additional parameters to substitute.
        public addWarning(code: string, ...params) {
            this.Errors.push(new ErrorMessage(code, this.getMessage(code, params), ErrorSeverity.Warning));
        }

        // Adds a critical error to the list with the given error code and additional parameters to substitute
        // and aborts the current operation with the reason being this message if required.
        public criticalError(code: string, abort: boolean, ...params) {
            var errMsg = new ErrorMessage(code, this.getMessage(code, params), ErrorSeverity.Critical);
            this.Errors.push(errMsg);
            if (abort) this.abort(errMsg.Message);
        }

        // Aborts the current operation with the specified reason by throwing an error.
        public abort(reason: string) {
            var err = new Error(reason);
            err["__errors__"] = this.Errors();
            throw err;
        }

        // Checks if the current list has any errors or critical errors.
        public hasErrors(): boolean {
            return this.Errors().some((err) => { return err.Severity > ErrorSeverity.Warning });
        }

        // Aborts the current operation in the current list has any errors.
        public abortIfHasErrors() {
            if (this.hasErrors()) this.abort(this.ErrorsText());
        }

        // Merges the current list with another error list.
        public mergeWith(otherList: ErrorList) {
            if (otherList != null)
                ko.utils.arrayPushAll<ErrorMessage>(this.Errors, otherList.Errors());
        }
   }
}