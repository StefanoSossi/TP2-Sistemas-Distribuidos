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
const topicMaster='upb/master/register';

let contip = "";
let ip = dockerIpTools.getContainerIp()
  .then((containerIp) => saveIp(containerIp) );
  //console.log("Ip: " + contip);


client.on('connect', () => {
    publishMaster();
    
})
client.on('message', function (topic, message) {
    console.log("[Received] topic: " + topic.toString());  //Print topic name
    console.log("[Received] message: " + message.toString()); //Print payload
    let msg = JSON.parse(message);
    let id = msg["sensor_id"];
    let topicEsp32 = 'upb/'+id+'/response';
    console.log('topic new: '+topicEsp32);
    publishEsp32(topicEsp32);
})

async function publishMaster() {
  console.log('publish to master ');
  let id = await getId();
  let obj = {
        "worker_id" : id
        };
  client.publish(topicMaster, JSON.stringify(obj));
  let topicEsp32 = 'upb/'+id+'/request';
  client.subscribe(topicEsp32);
  console.log("coneccted to " + topicEsp32);
}
async function publishEsp32(topicEsp32) {
  let freq = Math.random() * (maxfreq - minfreq) + minfreq;
  freq = freq.toFixed(2);
  let iteration = Math.random() * (maxite - minite) + minite;
  iteration = Math.round(iteration);
  
  let obj = {
        "freq" : freq,
        "iteration" :  iteration
        };
  
  client.publish(topicEsp32, JSON.stringify(obj));
  console.log('publish to esp32 ' + topicEsp32);
  console.log('data: ' + freq + ' ' + iteration );
}


function saveIp(ip){
    contip = ip;
}


//setInterval(publishMaster, 2500);
//setInterval(publishEsp32, 2500);
