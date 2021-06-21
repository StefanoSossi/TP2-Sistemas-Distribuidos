var PROTO_PATH = __dirname + "/TP6.proto";
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


 
function SayHello(call, callback){
   console.log("Message from C#: " + JSON.stringify(call.request));
   //call.write(call.request.name);
    callback(null,{ message: call.request.name});

}

function mainConnectGRPC() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {SayHello: SayHello});
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(), (err,port) => {
      console.log("Server running at http://0.0.0.0:50051")
        server.start();
    });
}

mainConnectGRPC();