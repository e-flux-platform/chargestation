#!/bin/bash
git checkout master && git pull

resourceName="europe-west3-docker.pkg.dev/eflux-production/docker/charge-station-simulator"
latestCommit=$(git rev-parse HEAD)

if [ -z "$latestCommit" ]
then
  echo "No commit found"
  exit 1
fi

docker build -t $latestCommit .

docker tag $latestCommit $resourceName:$latestCommit
docker push $resourceName:$latestCommit
