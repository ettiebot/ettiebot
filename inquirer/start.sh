docker stop ettie-inquirer && docker rm ettie-inquirer && docker image rm ettie-client
docker build -t ettie-inquirer -f ./Dockerfile .
docker run -d --name ettie-inquirer --network bridge -it ettie-inquirer