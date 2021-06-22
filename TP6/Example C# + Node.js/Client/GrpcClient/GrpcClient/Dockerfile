FROM mcr.microsoft.com/dotnet/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
EXPOSE 50051

FROM mcr.microsoft.com/dotnet/sdk:3.1 AS build
WORKDIR /src
COPY ["GrpcClient/GrpcClient.csproj", "GrpcClient/"]
RUN dotnet restore "GrpcClient/GrpcClient.csproj"
COPY . .
WORKDIR "/src/GrpcClient"
RUN dotnet build "GrpcClient.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GrpcClient.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GrpcClient.dll"]
