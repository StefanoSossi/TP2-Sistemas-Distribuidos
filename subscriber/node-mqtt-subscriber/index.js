const mqtt = require('mqtt');

let address = process.env.ADDRESS;
let PORT = process.env.PORT;
const options = {
    host: address,
    port: PORT,
    keepalive: 60,
};
var client = mqtt.connect(options);
let topic= process.env.TOPIC
client.on('connect', () => {
    client.subscribe(topic)
})
client.on('message', function (topic, message) {
    console.log("[Received] topic: " + topic.toString());  //Print topic name
    console.log("[Received] message: " + message.toString()); //Print payload
})

