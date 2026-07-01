# What is a Signal?
### `A signal is a message sent by the Operating System to a process.`
- OS -> Signal -> Node Process

OS is telling the process: 
Do Something : 
- Stop
- Terminate 
- Reload
- Continue
- Pause

# First Signal: SIGINT
### SIGINT - Signal Interrupt 
#### Usually send When: 
- Ctrl + C is pressed
```js
process.on("SIGINT", () => {
    console.log("SIGINT Received");
})
```
- Output : SIGINT Received 