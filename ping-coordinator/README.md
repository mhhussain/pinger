# ping-coordinator

### Docker Build and Run

Build
```
docker build -t moohh/ping-coordinator .
```

Run
```
docker run -t --name ping-coordinator -e PORT=5001 -p 5001:5001 -d moohh/ping-coordinator
```