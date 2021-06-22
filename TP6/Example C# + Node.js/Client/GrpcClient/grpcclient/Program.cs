using Grpc.Core;
using Grpc.Net.Client;
using System;
using System.Threading.Tasks;

// mqtt library
using MQTTnet;
using MQTTnet.Client.Options;
using MQTTnet.Client;
using System.Net;
using System.Runtime.InteropServices.ComTypes;

namespace GrpcClient
{
    class Program
    {
        const string DefaultHost = "10.1.2.123";
        const int Port = 50051;
        
        
        public static void  Main(string[] args)
        {
            RunAsync(args).Wait();
        }
        private static async Task RunAsync(string[] args)
        {
            var host = args.Length == 1 ? args[0] : DefaultHost;
            var channelTarget = $"{host}:{Port}";

            //mqtt
            try
            {
                var factory = new MqttFactory();
                var mqttClient = factory.CreateMqttClient();
                var options = new MqttClientOptionsBuilder()
                .WithClientId("Client1")
                .WithTcpServer("10.1.2.123", 1883)
                .WithCleanSession()
                .Build();

                mqttClient.UseConnectedHandler(e =>
                {
                    Console.WriteLine("Connected successfully with MQTT Brokers.");
                });
                mqttClient.UseDisconnectedHandler(e =>
                {
                    Console.WriteLine("Disconnected from MQTT Brokers.");
                });


                mqttClient.ConnectAsync(options).Wait();

            




            //

            Console.WriteLine($"Target: {channelTarget}");

            // Create a channel
            var channel = new Channel(channelTarget, ChannelCredentials.Insecure);

            try
            {
                // Create a client with the channel
                var client = new Greeter.GreeterClient(channel);

                // Create a request
                /*
                var request = new HelloRequest
                {
                    Name = "RequestCLI",
                };

                // Send the request
                Console.WriteLine("GreeterClient sending request");
                var response = await client.SayHelloAsync(request);

                Console.WriteLine("GreeterClient received response: " + response.Message);
                */
                string worker_id = System.Environment.MachineName;

                var requestRegister = new RegisterRequest
                {
                    WorkerId = worker_id,
                };
                // send register
                var responseRegister = await client.registerAsync(requestRegister);

                Console.WriteLine("GreeterClient received response: " + responseRegister.Freq + " ; " + responseRegister.Iteration);
                var freq = responseRegister.Freq;
                var iteration = responseRegister.Iteration;
                while (true)
                {
                    receiveSensorId(client, mqttClient, freq, iteration, worker_id);
                }
            }
            finally
            {
                // Shutdown
                await channel.ShutdownAsync();
            }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }


        }
        private static async void publishToEsp32(IMqttClient mqttClient, string topic, float freq, int iteration)
        {

            string msg = "{ \"freq\" : "+ freq + ",\"iteration\" : " + iteration + "}";

            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(msg)
                .WithExactlyOnceQoS()
                .WithRetainFlag()
                .Build();

            await mqttClient.PublishAsync(message);
        }

        private static async void receiveSensorId(Greeter.GreeterClient client,IMqttClient mqttClient,float freq, int iteration, string worker_id)
        {
            var requestSendTask = new sendTaskRequest{};
            var responseRegister = await client.sendTaskAsync(requestSendTask);

            Console.WriteLine("GreeterClient received response: " + responseRegister.SensorId);
            if (responseRegister.WorkerId.Equals(worker_id)) {
                string topicEsp32 = "upb/" + responseRegister.SensorId + "/response";
                publishToEsp32(mqttClient, topicEsp32, freq, iteration);
            } 
        }
    }
}
