// test.js
const { classifyMessage } = require("./triageEngine");

let state = null;

// Initial Greeting
let res0 = classifyMessage("Hi", state);
console.log("BOT:", res0.botResponse); 
state = res0.state;

// User inputs a symptom
let res1 = classifyMessage("I have back pain", state);
console.log("USER: I have back pain");
console.log("BOT:", res1.botResponse); // Should ask: "Did this start after an injury?"
state = res1.state;

// User answers the follow-up
let res2 = classifyMessage("No, it just started", state);
console.log("USER: No, it just started");
console.log("BOT:", res2.botResponse); // Should ask: "Does movement make it worse?"
state = res2.state;