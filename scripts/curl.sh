#!/usr/bin/env bash

ssh_key="$(cat "126418023d11.pem.pub")"
curl -X POST '52.12.110.141:3900/addkey' -H 'Content-Type: application/json' -d @- <<EOF
  {"sshKey":"$ssh_key"}
EOF
