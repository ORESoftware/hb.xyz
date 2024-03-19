#!/usr/bin/env bash

curl -X POST '0.0.0.0:3900/addkey' -H 'Content-Type: application/json' -d '{"sshKey":"foobarbazjam"}'
