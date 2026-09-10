#!/usr/bin/env sh

set -eu

export vibe_with_color='no'
export vibe_running_locally='no'
export vibe_listen_to_stdin='no'

echo 'starting application...'
exec "$@"
