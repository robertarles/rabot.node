#!/bin/bash
BASEDIR=$(dirname "$0")
pushd $BASEDIR
/usr/local/bin/node index.js locationCheck
