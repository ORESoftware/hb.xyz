#!/usr/bin/env bash

ssh-add -D
#ssh-add '126418023d11.pem'
ssh -vvv -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i '126418023d11.pem' "ubuntu@${hb_ip_addr}" # 'bash -c "docker exec -ti 04f2dc45836c bash"'
