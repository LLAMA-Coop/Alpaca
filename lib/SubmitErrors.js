/*  Intended for front end use when a submit button is clicked.
    This is for a component to track and display error messages to the user.
    Also tracks when these errors should prevent submission to server. */

export default class SubmitErrors {
    constructor() {
        this.errors = [];
        this.cannotSend = false;
    }

    addMessage(message, setter, doNotSend = true) {
        if (Array.isArray(setter)) {
            setter.forEach((s) => s(message));
        } else {
            setter(message);
        }
        this.errors.push(message);
        this.cannotSend = doNotSend;
    }

    addError(message, doNotSend = true){
        this.errors.push(message);
        this.cannotSend = doNotSend;
    }

    displayErrors() {
        let message = "Please correct the following:";
        this.errors.forEach((err) => (message += "\n" + err));
        return message;
    }
}
