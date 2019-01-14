// Copyright (c) 2019 Xomega.Net. All rights reserved.

module xomega {

    // An error message that consists of an error code, a text message and the severity.
    // Error messages are typically added to an error list and can be serialized
    // to allow sending them in a service call.
    export class ErrorMessage {

        // Constructs an error message with a given code, message and severity.
        public constructor(code: string, message: string, severity: ErrorSeverity) {
            this.Code = code;
            this.Message = message;
            this.Severity = severity;
        }

        // Error code, which is an error identifier.
        public Code: string;

        // Full error message text in the current language.
        public Message: string;

        // Error severity, which may affect the execution flow.
        public Severity: ErrorSeverity;

        // Deserializes an ErrorMessage object from JSON that contains a serialized Xomega Framework ErrorMessage.
        public static fromJSON(obj): ErrorMessage {
            return new ErrorMessage(obj.Code, obj.Message, obj.Severity);
        }
    }
}