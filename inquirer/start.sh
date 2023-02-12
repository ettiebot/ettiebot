docker stop ettie-inquirer
docker rm ettie-inquirer
docker image rm ettie-inquirer
docker build -t ettie-inquirer -f ./Dockerfile .
docker run -d --restart unless-stopped --name ettie-inquirer --network bridge -it ettie-inquirer