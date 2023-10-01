#!/bin/sh

if [ -n "$1" ]; then
    git -c advice.detachedHead=false checkout $1 || exit 1
fi

sh scripts/build.sh

echo "/* /index.html 200" > build/_redirects

netlify deploy --dir build --prod

if [ -n "$1" ]; then
    git checkout main
fi

