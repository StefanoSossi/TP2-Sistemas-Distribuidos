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

let ip = dockerIpTools.getContainerIp()
  .then((containerIp) => containerIp );
  console.log(ip); 

async function publishdata() {
  let id = await getId();
  let obj = {
	"time" : new Date(),
	"container" : id,
	"ip" :  ip
	};
  client.publish('upb/ds/class', JSON.stringify(obj));
}

setInterval(publishdata, 2500); 
