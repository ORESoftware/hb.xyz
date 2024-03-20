#!/usr/bin/env sh

# note: we must use sh instead of bash, it's more cross-platform
# for example in Alpine linux images/containers, etc

set -e;

if [ "$skip_postinstall" = "yes" ]; then   # TODO rename 'skip_postinstall' to something more specific
    echo "skipping postinstall routine.";
    exit 0;
fi

export FORCE_COLOR=1;
export skip_postinstall="yes";   # TODO rename 'skip_postinstall' to something more specific

mkdir -p "$HOME/.oresoftware/bin" || {
  echo "Could not create .oresoftware dir in user home.";
  exit 1;
}


# the end of the postinstall script


