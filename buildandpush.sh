#!/bin/bash
git checkout master && git pull

resource=$1
latestCommit=$(git rev-parse HEAD)

if [ -z "$latestCommit" ]
then
  echo "No commit found"
  exit 1
fi

docker build -t $latestCommit .

docker tag $latestCommit $resource:$latestCommit
docker tag $latestCommit $resource:latest

docker push $resource:$latestCommit
