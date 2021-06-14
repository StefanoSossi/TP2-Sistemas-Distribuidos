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
let ip = dockerIpTools.getContainerIp()
  .then((containerIp) => saveIp(containerIp) );
  console.log("Ip: " + contip);

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
  let id = await getId();
  let obj = {
        "freq" : freq,
        "iteration" :  iteration
        };
  let topicEsp32 = 'upb/'+id+'/response'
  client.publish(topicEsp32, JSON.stringify(obj));
}


function saveIp(ip){
    contip = ip;
}


setInterval(publishMaster, 2500);
setInterval(publishEsp32, 2500);
