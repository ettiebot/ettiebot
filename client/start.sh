docker stop ettie-client && docker rm ettie-client
docker build -t ettie-client -f ./Dockerfile .
docker run -d --name ettie-client --network bridge -it ettie-client