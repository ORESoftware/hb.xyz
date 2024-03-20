#!/usr/bin/env sh

export keep_running=true

node --version

# Define a handler function for SIGINT
cleanup() {
  echo "SIGINT caught, cleaning up..."
  keep_running=false
  # Perform any cleanup tasks here
  exit 0
}

export cleanup;
trap cleanup INT

echo;
echo 'env vars:';
env | sort;
echo 'starting application...';

args="$@"
echo "docker container arguments: '$args'"

export vibe_with_color='no';
export vibe_running_locally='no';
export vibe_listen_to_stdin='no';


while $keep_running; do

  "${@}" || {
    echo "Application exited with a non-zero code: '$?'";
    sleep 3;
  };

done;
