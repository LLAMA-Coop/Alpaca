export default class SubmitErrors {
    constructor() {
        this.errors = [];
        this.cannotSend = false;
    }

    // Intended for component use
    // Setter is the useState setter
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
