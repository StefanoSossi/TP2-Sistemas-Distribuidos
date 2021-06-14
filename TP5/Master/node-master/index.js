const mqtt = require('mqtt');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://mongo:27017/tp5-db";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tp5-db");
    dbo.createCollection("workers", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  }); 

let address = process.env.ADDRESS;
let PORT = process.env.PORT;
const options = {
    host: address,
    port: PORT,
    keepalive: 60,
};
var client = mqtt.connect(options); 
let topic= process.env.TOPIC // upb/master/+
client.on('connect', () => {
    client.subscribe(topic)
})
client.on('message', function (topic, message) { 
    if(topic == 'upb/master/register')
    {
        console.log("[Received] topic: " + topic.toString());  //Print topic name
        console.log("[Received] message: " + message.toString()); //Print payload
        PUT(message);
    }
    else if(topic == 'upb/master/request')
    {
        console.log("[Received] topic: " + topic.toString());  //Print topic name
        console.log("[Received] message: " + message.toString()); //Print payload
        let requestedWorker = GET();
        DELETE();
        let response = {
            "destination" : message["sensor_id"],
            "worker" : requestedWorker["worker_id"]
            };
        client.publish('upb/master/response', JSON.stringify(response));
    }
})

    function PUT(message){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("tp5-db");
            var workertoRegister = JSON.parse(message);
            dbo.collection("workers").insertOne(workertoRegister, function(err, obj) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
        });
      })

}
    function GET(){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("tp5-db");
            dbo.collection("workers").findOne({},function(err, result) {
              if (err) throw err;
              console.log(result);
              return result;
              db.close();
            });
          }); 
}
    function DELETE(){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("tp5-db");
            dbo.collection("workers").deleteOne({}, function(err, obj) {
              if (err) throw err;
              console.log("1 document deleted");
              db.close();
            });
          }); 
}

