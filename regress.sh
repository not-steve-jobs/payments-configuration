#!/bin/bash

ORIGINAL_BRANCH=$(git branch --show-current)
STABLE_BRANCH=${1:-'release'}
CP_TABLES_FULL_PATH=dumps/cp_tables.tar.gz
CP_TABLES_SCRIPTS=dumps/sql
DB_CONTAINER_NAME=config-pro-mariadb
CP_TABLES_DUMP_REMOTE_URL=depot.quotix.io/exchange/dump.tar.gz

initFolders() {
  mkdir -p dumps > /dev/null 2>&1
  mkdir -p dumps/sql > /dev/null 2>&1
}

runDBIfNotExist() {
  if ! docker info &> /dev/null; then
      echo "Docker daemon is not running. Please run docker"
      exit 1
  fi

  if ! docker ps --format '{{.Names}}' | grep -q $DB_CONTAINER_NAME; then
      docker-compose up -d
      until docker exec -i $DB_CONTAINER_NAME sh -c 'echo "SELECT 1"' &> /dev/null; do
          echo "Waiting for the database to become available..."
          sleep 1
      done
  fi
}

buildAndRunRegress() {
    echo "Build and run regress on $1 branch."
    npm install && npm run build
    npm run test:regress
    echo "Snapshots are written."
}

downloadDumpIfNotExist() {
  if [ ! -e "$CP_TABLES_FULL_PATH" ]; then
      echo "Downloading dump..."
      wget -O "$CP_TABLES_FULL_PATH" "$CP_TABLES_DUMP_REMOTE_URL"

      if [ $? -eq 0 ]; then
          echo "Download successful."
      else
          echo "Error downloading dump. Please check the log for details."
      fi
  else
      echo "Dump already exists, skip downloading."
  fi
}

restoreDump() {
  echo "Dump restoring..."
  tar -xzf $CP_TABLES_FULL_PATH -C $CP_TABLES_SCRIPTS
  cat $CP_TABLES_SCRIPTS/* | docker exec -i $DB_CONTAINER_NAME mysql -h 0.0.0.0 -P 3306 -uroot -pS3jGVFWYHnFMukB test-payments-configuration-management-service
  echo "Dump restored."
}

# Delete previous snapshots
rm -r ./test/regress/interop/__snapshots__

runDBIfNotExist;
initFolders;
downloadDumpIfNotExist;
restoreDump;

git checkout $STABLE_BRANCH
buildAndRunRegress $STABLE_BRANCH
git stash

git checkout $ORIGINAL_BRANCH
git stash apply
buildAndRunRegress $ORIGINAL_BRANCH
