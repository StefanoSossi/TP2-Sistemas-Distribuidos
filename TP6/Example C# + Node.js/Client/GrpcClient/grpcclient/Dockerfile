FROM mcr.microsoft.com/dotnet/sdk:3.1 AS build
WORKDIR /app
EXPOSE 80
EXPOSE 443
EXPOSE 50051

COPY . .
RUN dotnet restore
ENTRYPOINT ["./startmaster.sh","dotnet","run"]
