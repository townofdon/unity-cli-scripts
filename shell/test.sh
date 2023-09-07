#!/bin/bash

#
# 
# 
# 
# This script is invoked via JS scripts
# 
# 
# 
# 
#

source "./_utils.sh"

#
# SCRIPT
#
UNITY_WEBGL_BUILD_DIR=$(readEnvVar UNITY_WEBGL_BUILD_DIR)
TEMP_ARCHIVE_DIR="../test/webgl"

assertFileExists "${UNITY_WEBGL_BUILD_DIR}/index.html"
rm -rf "$TEMP_ARCHIVE_DIR"
mkdir -p "$TEMP_ARCHIVE_DIR"
cp -a "${UNITY_WEBGL_BUILD_DIR}/." "$TEMP_ARCHIVE_DIR"

cd ../test

docker-compose up
