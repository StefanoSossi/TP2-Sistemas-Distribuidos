const mqtt = require('mqtt');
const getId = require('docker-container-id');
const address = '10.1.2.123';
const dockerIpTools = require("docker-ip-get");
const PORT = 1883;
const maxfreq = 1.5;
const minfreq = 0.5;
const maxite = 20;
const minite = 5;
const options = {
    host: address,
    port: PORT,
    keepalive: 60,
    //clientId: clientID,
    // username: "testing_user",
    // password: "password",
    // protocol: 'mqtts',
    // rejectUnauthorized: true,
    // ca: TRUSTED_CA_LIST
};
const client = mqtt.connect(options);
const topicMaster='upb/master/register'

let contip = "";
let id = getId();
const topicEsp32 = 'upb/'+id+'/response'
let ip = dockerIpTools.getContainerIp()
  .then((containerIp) => saveIp(containerIp) );
  console.log("Ip: " + contip);


client.on('connect', () => {
    client.subscribe(topicEsp32)
    publishMaster();
})
client.on('message', function (topic, message) {
    console.log("[Received] topic: " + topic.toString());  //Print topic name
    console.log("[Received] message: " + message.toString()); //Print payload
    publishEsp32();
})

async function publishMaster() {
  let id = await getId();
  let obj = {
        "worker_id" : id
        };
  client.publish(topicMaster, JSON.stringify(obj));
}
async function publishEsp32() {
  let freq = Math.random() * (maxfreq - minfreq) + minfreq;
  freq = freq.toFixed(2);
  let iteration = Math.random() * (maxite - minite) + minite;
  iteration = iteration.toFixed(2);
  
  let obj = {
        "freq" : freq,
        "iteration" :  iteration
        };
  
  client.publish(topicEsp32, JSON.stringify(obj));
}


function saveIp(ip){
    contip = ip;
}


//setInterval(publishMaster, 2500);
//setInterval(publishEsp32, 2500);
