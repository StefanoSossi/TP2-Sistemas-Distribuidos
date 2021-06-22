const mqtt = require("mqtt");
const mongodb = require("mongodb");
const uri = "mongodb://mongo:27017/";
const url = "mongodb://mongo:27017/tp6-db";
var PROTO_PATH = __dirname + "/TP6.proto";
var sensor_id = '';
var worker = '';

let address = "research.upb.edu";
let PORT = 11232;
const options = {
  host: address,
  port: PORT,
};
let client = mqtt.connect(options);
let topic = "upb/master/+"; // upb/master/+

var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
var hello_proto = grpc.loadPackageDefinition(packageDefinition).TP6;

//Creating a mongodb database
  mongodb.MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });
// Creating collection
  mongodb.MongoClient.connect(uri, function (err, db) {
    if (err) throw err;
    var dbo = db.db("tp6-db");
    dbo.createCollection("workers", function (err, res) {
      if (err) throw err;
      console.log("Collection created!");
    });
    db.close();
  });

//Connectig to mqtt brocker
client.on("connect", () => {
  console.log("Connected to topic: " + topic);
  client.subscribe(topic);
});

mainConnectGRPC();

mongodb.MongoClient.connect(uri, function (error, database) {
  if (error != null) {
    throw error;
  }
  var dbo = database.db("tp6-db");
  var collection = dbo.collection("workers");


  client.on("message", async function (topic, message) {
    if (topic == "upb/master/request") {
      console.log("[Received] topic: " + topic.toString()); //Print topic name
      console.log("[Received] message: " + message.toString()); //Print payload
      let messageParsed = JSON.parse(message);
      console.log("Worker: " + messageParsed["worker"]);
      if (messageParsed["worker"] != "") {
        console.log("Re-registering worker: " + messageParsed["worker"]);
        let reRegisterWorker = {
          worker_id: messageParsed["worker"],
        };
        collection.insertOne(reRegisterWorker, function (error, result) {
          if (error != null) {
            console.log("ERROR: " + error);
          }
          console.log("1 document inserted");
        });
      }
      let getWorker = function () {
        return new Promise((resolve, reject) => {
          collection.findOne({}, (err, data) => {
            err ? reject(err) : resolve(data);
          });
        });
      };
      var request = await getWorker();
      console.log(request);
      collection.deleteOne({}, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
      });
       sensor_id = messageParsed["sensor_id"];
       worker = request["worker_id"];
      //  client.publish('upb/master/response', JSON.stringify(response));
    }
  });
});

function register(call, callback) {
  const maxfreq = 1.5;
  const minfreq = 0.5;
  const maxite = 20;
  const minite = 5;
  console.log("worker id = " + call.request.worker_id);

  let freq = Math.random() * (maxfreq - minfreq) + minfreq;
  freq = freq.toFixed(2);
  let iteration = Math.random() * (maxite - minite) + minite;
  iteration = Math.round(iteration);

  
  let message = {
    worker_id: call.request.worker_id
  };

  mongodb.MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("tp6-db");
    var collection = dbo.collection("workers");
    collection.insertOne(JSON.parse(message), function (error, result) {
      if (error != null) {
        console.log("ERROR: " + error);
      }
      console.log("1 document inserted");
    });
    db.close();
  });

  callback(null, { freq: freq , iteration: iteration });
}

function sendTask(call, callback) {
  if (sensor_id != '') {
    callback(null, { sensor_id: sensor_id, worker_id: worker_id })
  }
}

function mainConnectGRPC() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, { register: register, sendTask: sendTask});
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(), (err,port) => {
      console.log("Server running at http://0.0.0.0:50051")
        server.start();
    });
}

