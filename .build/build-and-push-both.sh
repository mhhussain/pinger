docker build -t moohh/ping-coordinator ../ping-coordinator
docker push moohh/ping-coordinator

docker build -t moohh/pinger ../pinger
docker push moohh/pinger