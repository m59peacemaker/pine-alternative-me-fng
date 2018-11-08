#!/bin/sh

set -e

npm run build

if [ "$TRAVIS" = "true" ]; then
	git config user.email "travis@travis-ci.org"
	git config user.name "Travis CI"
fi

# if script was updated
if [ -n "`git status dist -s`" ]; then
	if [ "$CI" = "true" ]; then
		echo 'comitting build to git...'
		git checkout master
		git add dist
		git commit -m "FnG build `date --iso-8601=minutes` [ci skip]"
		git remote add build https://${GITHUB_TOKEN}@github.com/m59peacemaker/pine-alternative-me-fng.git > /dev/null 2>&1
		git push --quiet build master
	fi

	./lib/publish-build.mjs
fi
