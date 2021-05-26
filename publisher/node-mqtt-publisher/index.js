const mqtt = require('mqtt');
const getId = require('docker-container-id');
const address = '10.1.2.123';
const dockerIpTools = require("docker-ip-get");
const PORT = 7777;
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
const topic="upb/ds/class"
let contip = "";
let ip = dockerIpTools.getContainerIp()
  .then((containerIp) => saveIp(containerIp) );
  console.log(contip);

async function publishdata() {
  let id = await getId();
  let obj = {
        "time" : new Date(),
        "container" : id,
        "ip" :  contip
        };
  client.publish('upb/ds/class', JSON.stringify(obj));
}

function saveIp(ip){
    contip = ip;
}


setInterval(publishdata, 2500);

