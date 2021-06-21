using Grpc.Core;
using Grpc.Net.Client;
using System;
using System.Threading.Tasks;


namespace GrpcClient
{
    class Program
    {
        const string DefaultHost = "localhost";
        const int Port = 50051;
        public static void  Main(string[] args)
        {
            RunAsync(args).Wait();
        }
        private static async Task RunAsync(string[] args)
        {
            var host = args.Length == 1 ? args[0] : DefaultHost;
            var channelTarget = $"{host}:{Port}";

            Console.WriteLine($"Target: {channelTarget}");

            // Create a channel
             var channel = new Channel (channelTarget , ChannelCredentials.Insecure);

            try
            {
                // Create a client with the channel
                var client = new Greeter.GreeterClient(channel);

                // Create a request
                var request = new HelloRequest
                {
                    Name = "RequestCLI",
                };

                // Send the request
                Console.WriteLine("GreeterClient sending request");
                var response = await client.SayHelloAsync(request);

                Console.WriteLine("GreeterClient received response: " + response.Message);
            }
            finally
            {
                // Shutdown
                await channel.ShutdownAsync();
            }
        }
    }
}
