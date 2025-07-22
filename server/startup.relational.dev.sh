#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5434
npm run migration:run
npm run seed:run:relational
npm run start:prod
