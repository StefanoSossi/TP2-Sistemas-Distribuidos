const mqtt = require("mqtt");
const mongodb = require("mongodb");
const uri = "mongodb://mongo:27017/";
const http = require("http");
import mainConnectGRPC from "./greeter_server";

//create a server object:
http
  .createServer(function (req, res) {
    res.write("OK"); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080

let address = "research.upb.edu";
let PORT = 11232;
const options = {
  host: address,
  port: PORT,
};
let client = mqtt.connect(options);
let topic = "upb/master/+"; // upb/master/+

client.on("connect", () => {
  console.log("Connected to topic: " + topic);
  client.subscribe(topic);
});

mongodb.MongoClient.connect(uri, function (error, database) {
  if (error != null) {
    throw error;
  }
  var dbo = database.db("tp6-db");
  dbo.createCollection("workers", function (err, res) {
    if (err) throw err;
    console.log("Collection created!");
  });
  var collection = dbo.collection("workers");
  
  var sensor_id = '';
  var worker = '';

  mainConnectGRPC();

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

export { sensor_id , worker };
