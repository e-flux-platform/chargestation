#!/bin/bash
git checkout master && git pull

resource=$1
latestCommit=$(git rev-parse HEAD)

if [ -z "$latestCommit" ]
then
  echo "No commit found"
  exit 1
fi

docker build -t $resource:$latestCommit .

docker tag $resource:$latestCommit $resource:latest
docker push $resource:$latestCommit
docker push $resource:latest
