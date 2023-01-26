docker build -t ettie-server -f ./server.Dockerfile .
docker build -t ettie-client -f ./client.Dockerfile .

docker run -d --name ettie-client --network bridge -it ettie-client
docker run -d --name ettie-server --network bridge -it ettie-server