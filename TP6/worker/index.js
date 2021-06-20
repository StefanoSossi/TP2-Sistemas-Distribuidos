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
const clientMQTT = mqtt.connect(options);

let ip = dockerIpTools.getContainerIp()
  .then((containerIp) => saveIp(containerIp) );
  //console.log("Ip: " + contip);
var PROTO_PATH = __dirname + '/../proto/TP6.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });



var gRCP_proto = grpc.loadPackageDefinition(packageDefinition).TP6;

var target = 'localhost:50051';
  var clientgRPC = new gRCP_proto.Greeter(target,
                                       grpc.credentials.createInsecure());
  
let worker_id;

let freq;
let iteration;
let sensor_id;

clientMQTT.on('connect', () => {
    //conected with mqtt
    generateWorkerId();
    maingRPC();
})
clientMQTT.on('message', function (topic, message) {
    console.log(" clientMQTT mqtt on ");
    
})

async function publishEsp32(topicEsp32) {
  let obj = {
        "freq" : freq,
        "iteration" :  iteration
        };
  
  clientMQTT.publish(topicEsp32, JSON.stringify(obj));
  console.log('publish to esp32 ' + topicEsp32);
  console.log('data: ' + freq + ' ' + iteration );
}


function saveIp(ip){
    contip = ip;
}

function maingRPC() {
  
  clientgRPC.register({worker_id: worker_id}, function(err, response) {
    console.log('freq and iteration recived :', response.message);
    freq = response.freq;
    iteration = response.iteration;
  });

}
async function generateWorkerId() {
  worker_id = await getId();
  console.log('worker id: ' + id);
}
function reciveSensorId(){
  clientgRPC.sendTask(null, function(err, response) {
    if(response.worker_id == worker_id){
      console.log('sensor_id recived :', response.message);
      sensor_id = response.sensor_id;
      let topicEsp32 = 'upb/'+sensor_id+'/response'; //once message arrives set topic
      publishEsp32(topicEsp32)
    }
  });
}
setInterval(reciveSensorId, 5000);
//setInterval(publishEsp32, 2500);
