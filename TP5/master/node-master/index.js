const mqtt = require('mqtt');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/tp5-db";
const http = require('http');

//create a server object:
http.createServer(function (req, res) {
  res.write('OK'); //write a response to the client
  res.end(); //end the response
}).listen(8080); //the server object listens on port 8080 

let address = process.env.ADDRESS;
let PORT = process.env.PORT;
const options = {
    host: address,
    port: PORT
};
let client = mqtt.connect(options); 
let topic = process.env.TOPIC // upb/master/+

client.on('connect', () => {
    console.log("Connected to topic: " + topic);
    client.subscribe(topic)
})

MongoClient.connect(url, function(error, database) {
    if(error != null) {
        throw error;
    }
    var dbo = database.db("tp5-db");
    dbo.createCollection("workers", function(error, res) {
        if (error) throw error;
        console.log("Collection created!");
      });
    var collection = dbo.collection("workers");
   // collection.createIndex( { "topic" : 1 } );

    client.on('message', function (topic, message) {
        if(topic == 'upb/master/register'){
            console.log("[Received] topic: " + topic.toString());  //Print topic name
            console.log("[Received] message: " + message.toString()); //Print payload
            collection.insert(message, function(error, result) {
                if(error != null) {
                    console.log("ERROR: " + error);
                }
            });
        }
        else if(topic == 'upb/master/request')
        {
            console.log("[Received] topic: " + topic.toString());  //Print topic name
            console.log("[Received] message: " + message.toString()); //Print payload
            let requestedWorker = collection.findOne({},function(err, result){
                if (err) throw err;
                console.log(result);
                return result;
            });
            collection.deleteOne({}, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
              });
            let response = {
                "destination" : message["sensor_id"],
                "worker" : requestedWorker["worker_id"]
                };
            client.publish('upb/master/response', JSON.stringify(response));
        }
    });
});


