#!/usr/bin/env bash

# ssh -t -i 'scripts/coding-challenge.pem' "ubuntu@${hb_ip_addr}" "bash -C 'docker exec -ti f17068075923 bash'"

 ssh -i 'scripts/coding-challenge.pem' "ubuntu@${hb_ip_addr}" "bash"
