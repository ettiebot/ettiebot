docker stop ettie-client
docker rm ettie-client
docker image rm ettie-client
docker build -t ettie-client -f ./Dockerfile .
docker run -d --restart unless-stopped --name ettie-client --network bridge -it ettie-client