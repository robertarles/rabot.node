#!/bin/bash
BASEDIR=$(dirname "$0")
pushd $BASEDIR
node index.js weatherCheck
