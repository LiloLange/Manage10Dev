#!/usr/bin/env bash
/usr/local/bin/node /usr/local/lib/node_modules/npm/bin/npm-cli.js install --scripts-prepend-node-path=auto
/usr/local/bin/node /usr/local/lib/node_modules/npm/bin/npm-cli.js run webpack-dev-qt --scripts-prepend-node-path=auto
/usr/local/bin/node ./node_modules/.bin/lessc ./public/css/main.less ./public/css/main.css --source-map