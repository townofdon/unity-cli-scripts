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
# ARGS
#
VERSION="" # --version [required]
CLEANUP=false
while [ $# -gt 0 ]; do
  if [[ $1 == *"--"* ]]; then
    param="${1/--/}"
    upper=$(echo $param | tr '[:lower:]' '[:upper:]')
    underscore=$(echo $upper | sed "s/-/_/")
    value=$2
    # support boolean flags
    if [[ -z $value ]]; then
        value=true
    fi
    declare $underscore="$value"
  fi
  shift
done
assertVarExists $VERSION

#
# POPULATE VARS
#
USERNAME=$(readEnvVar ITCHIO_USERNAME)
GAME=$(readEnvVar ITCHIO_GAME)
CHANNEL=$(readEnvVar ITCHIO_CHANNEL)
UNITY_WEBGL_BUILD_DIR=$(readEnvVar UNITY_WEBGL_BUILD_DIR)
IS_MAC_OS=$(readEnvVar IS_MAC_OS)
assertVarExists $USERNAME
assertVarExists $GAME
assertVarExists $CHANNEL
assertVarExists $UNITY_WEBGL_BUILD_DIR
assertVarExists $IS_MAC_OS

SAFE_VERSION="${VERSION//./$'-'}"
TEMP_ARCHIVE_DIR="../archives"
ZIPFILE="$TEMP_ARCHIVE_DIR/build-${SAFE_VERSION}.zip"
ROOT_DIR=$PWD

#
# SCRIPT
#
info "WELCOME TO THE UNITY DEPLOYMENT SCRIPT!"
info "USER=${YELLOW}${USERNAME}"
info "GAME=${YELLOW}${GAME}"
info "About to push version ${RED}${VERSION}${CYAN} - proceed?"
prompt "(y/n)"

assertFileExists "${UNITY_WEBGL_BUILD_DIR}/index.html"
mkdir -p $TEMP_ARCHIVE_DIR

# zip
if $IS_MAC_OS
then
  log "creating zip archive for ${ZIPFILE}..."
  zip -rq $ZIPFILE $UNITY_WEBGL_BUILD_DIR
  assertFileExists $ZIPFILE
else
  log "creating zip archive for ${ZIPFILE}..."
  7z a $ZIPFILE $UNITY_WEBGL_BUILD_DIR > ./NUL
  assertFileExists $ZIPFILE
fi

log "deploying to itch.io..."

# push to itch.io
butler push $ZIPFILE "${USERNAME}/${GAME}:${CHANNEL}" --userversion $VERSION

# cleanup
rm -rf "./NUL"
rm -rf "../NUL"
if $CLEANUP; then
  rm -rf $TEMP_ARCHIVE_DIR
fi

success "All done!"
