const EventEmitter = require("events");

const emitterEvent = new EventEmitter();

class ErrorHandler extends EventEmitter {
  constructor() {
    super();
  }

  handleError(error) {
    this.emit("error", error.message);
  }
}

const errorHandler = new ErrorHandler();

errorHandler.on("error", (msg) => {
  console.log(`Error occurred: ${msg}`);
});
errorHandler.handleError(new Error("This is class error handler using event emitter."))