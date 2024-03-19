#!/usr/bin/env bash

set -e;

# "cm" is the commit message; default message is "set"
cm="${1:-'set'}"

echo 'compiling to make sure it works...'
tsc -p tsconfig.json
echo 'done compiling with tsc'

ssh-add -D
ssh-add ~/.ssh/id_ed25519

combined=""
for arg in "${@}"; do
  combined="${combined} ${arg}"
done

trimmed="$(echo "$combined" | xargs)"

if test "${trimmed}" == '' ; then
  trimmed="squash-me";
fi

git add .
git add -A
git commit -am "${trimmed}"
git push
