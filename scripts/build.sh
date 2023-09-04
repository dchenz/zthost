#!/bin/sh

export GENERATE_SOURCEMAP=false
export REACT_APP_GIT_COMMIT_HASH=$(git --no-pager log --pretty=format:'%h' -n 1)

react-scripts build
