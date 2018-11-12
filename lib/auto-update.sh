#!/bin/sh

set -e

build_commit_message="[build]"

if [ "${TRAVIS_COMMIT_MESSAGE}" = "${build_commit_message}" ]; then
	echo "This job was triggered by the build commit. Skipping build."
	exit 0
fi

npm install --no-save https://github.com/m59peacemaker/data-alternative-me-fng

npm run build

if [ "$TRAVIS" = "true" ]; then
	git config user.email "travis@travis-ci.org"
	git config user.name "Travis CI"
fi

# if script was updated
if [ -n "`git status dist -s`" ]; then
	echo 'publishing to TradingView...'
	./lib/publish-build.mjs

	if [ "$CI" = "true" ]; then
		echo 'committing build to git...'
		git checkout master
		git add dist
		git commit -m "${build_commit_message}"
		git remote remove origin
		git remote add origin "https://${GITHUB_TOKEN}@github.com/m59peacemaker/pine-alternative-me-fng.git" > /dev/null 2>&1
		git push --quiet origin master
	fi
else
	echo 'indicator is already up-to-date'
fi
