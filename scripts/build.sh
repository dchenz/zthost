#!/bin/sh

if [ -n "$1" ]; then
    git -c advice.detachedHead=false checkout $1 || exit 1
fi

export GENERATE_SOURCEMAP=false
export REACT_APP_GIT_COMMIT_HASH=$(git --no-pager log --pretty=format:'%h' -n 1)

react-scripts build

if [ -n "$1" ]; then
    git checkout main
fi
