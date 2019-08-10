#!/bin/sh
curl -X PUT -H "Content-Type: application/json" -d '{"answers": "ABC"}' http://localhost:3000/session/token