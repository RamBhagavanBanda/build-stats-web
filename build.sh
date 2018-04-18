#!/bin/bash

####
#GIT_COMMIT is typically set by Jenkins. If they are missing
#we will try to find them from the current git branch and logs
####
VERSION=${GIT_COMMIT}

which git
if [ $? -ne 0 ]; then
  echo "Fatal: No git found"
  exit 1
fi

BRANCH=`git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/'`
if [ -z ${VERSION} ]; then
  VERSION=`git log | head -1 | cut -f 2 -d " " 2> /dev/null`
fi

####
#Create a version.js file that will be used by buildInfo resource
####
TIME=`date "+%Y%m%d-%H%M"`
cat config/version_template.js | sed -e 's/__branch__/'${BRANCH}'/g' -e 's/__version__/'${VERSION}'/g' -e 's/__buildtime__/'${TIME}'/g' > config/version.js

####
#tar the files
####
echo 'node_modules/*' > exclude
echo 'build.sh' >> exclude
echo 'clone.sh' >> exclude
echo '*.md' >> exclude
echo '*.tar' >> exclude
echo '*.iws' >> exclude
echo '*.iml' >> exclude
echo '*.ipr' >> exclude
echo '.gitignore' >> exclude
echo 'exclude' >> exclude

BUNDLE=expedia-build-stats-web.tar
tar cvf ${BUNDLE} -X exclude *



