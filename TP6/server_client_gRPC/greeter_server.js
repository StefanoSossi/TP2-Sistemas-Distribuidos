const mongodb = require("mongodb");
const uri = "mongodb://mongo:27017/";
const url = "mongodb://mongo:27017/tp6-db";
var PROTO_PATH = __dirname + "/helloworld.proto";

var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
import { sensor_id , worker } from "./index.js";
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

const maxfreq = 1.5;
const minfreq = 0.5;
const maxite = 20;
const minite = 5;
/**
 * Implements the SayHello RPC method.
 */
mongodb.MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

mongodb.MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = database.db("tp6-db");
  dbo.createCollection("workers", function (err, res) {
    if (err) throw err;
    console.log("Collection created!");
  });
  db.close();
});
let workers = [];

function register(call, callback) {
  let freq = Math.random() * (maxfreq - minfreq) + minfreq;
  freq = freq.toFixed(2);
  let iteration = Math.random() * (maxite - minite) + minite;
  iteration = Math.round(iteration);
  let obj = "freq :" + freq + "iteration :" + iteration;
  console.log("worker id = " + call.request.worker_id);
  let message = {
    worker_id: call.request.worker_id
  };

  mongodb.MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = database.db("tp6-db");
    var collection = dbo.collection("workers");
    collection.insertOne(JSON.parse(message), function (error, result) {
      if (error != null) {
        console.log("ERROR: " + error);
      }
      console.log("1 document inserted");
    });
    db.close();
  });
 // workers.push(call);
  callback(null, { freq: freq , iteration:iteration });
}

function sayHello(call, callback) {
  if(sensor_id != ''){
  callback(null,{ sensor_id: sensor_id, worker: worker_id})
  }
}

/*
function sendTask(message) {
  workers.forEach(worker => {
      worker.write(message);
      });
}
*/

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
export default function mainConnectGRPC() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, { register: register, sayHello: sayHello});
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start();
    }
  );
}
