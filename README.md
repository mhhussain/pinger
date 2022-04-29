# pinger

### Docker Build and Run

Build
```
docker build -t moohh/pinger .
```

Run
```
docker run -t --name pinger -e PORT=5005 -e COORDINATOR_URL=localhost -e COORDINATOR_PORT=5001 -p 5005:5005 -d moohh/pinger
```