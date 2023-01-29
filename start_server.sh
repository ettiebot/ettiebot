docker stop ettie-server && docker rm ettie-server
docker build -t ettie-server -f ./server.Dockerfile .
docker run -d --name ettie-server --network bridge -it ettie-server