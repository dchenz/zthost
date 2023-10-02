#!/bin/sh

sh scripts/build.sh $1

echo "/* /index.html 200" > build/_redirects

netlify deploy --dir build --prod
