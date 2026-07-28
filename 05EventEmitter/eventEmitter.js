const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on("my-event", () => {
  console.log("This is my-evnet created but not called yet, it will be called using emit with created instance.");
  
})
emitter.once("once-event", (msg) => {
  console.log(`This event occured once: ${msg }`);
  
})
emitter.eventNames()
console.log("::::::::::::::::::::::::::::",emitter.eventNames());

emitter.emit("my-event")
emitter.emit("once-event", "This is the message for once-event");
emitter.emit("once-event", "This is the message for once-event"); // This will not be called again since it was registered with once
