#!/bin/sh
BN="$(basename "$0")"

OLD_BASE="$1" #v1.15.5
NEW_BASE="$2" #v1.15.6

# Git history size
MAX_COUNT=100

for t in "${OLD_BASE}" "${NEW_BASE}"; do
    test -z "${t}" && {
	echo >&2 "Aufruf: ${BN} old-base new-base"
	exit 1
    }
    git describe "${t}" >/dev/null 2>&1 || {
	echo >&2 "${BN}: Issues related to '${t}'"
	exit 1
    }
    expr "${t}" : "v" >/dev/null 2>&1 || {
	echo >&2 "${BN}: '${t}' does not start with 'v'"
	exit 1
    }
done

# $1 ... OLD_ULI
oldTag () {
    (
	for r in $(git rev-list --tags --max-count="${MAX_COUNT}"); do
	    tag="$(git describe --tags "${r}")"
	    matched="$(expr "${tag}" : "\(${1}-[0-9]*\)")"
	    if [ "${tag}" = "${matched}" ]; then
		echo "${tag}"
		exit 0
	    fi
	done
	exit 1
    )
}

OLD_ULI="$(echo "${OLD_BASE}"|cut -c2-)-uli"                                # OLD_ULI=1.15.5-uli
NEW_ULI="$(echo "${NEW_BASE}"|cut -c2-)-uli"                                # NEW_ULI=1.15.6-uli
git checkout "${OLD_ULI}"
OLD_TAG="$(oldTag "${OLD_ULI}")"                                            # OLD_TAG=1.15.5-uli-08
test "$(git describe "${OLD_TAG}")" != "$(git describe "${OLD_ULI}")" && {
  # Create a new tag for the old base
  OLD_TAG_COUNT="$(echo "${OLD_TAG}"|sed -e "s/^${OLD_ULI}-//")"            # OLD_TAG_COUNT=07
  INCREMENTED_COUNT="$(printf "%02d" "$(expr "${OLD_TAG_COUNT}" + 1)")"     # INCREMENTED_COUT=08
  OLD_TAG2="$(echo "${OLD_TAG}"|sed -e "s/-${OLD_TAG_COUNT}$/-${INCREMENTED_COUNT}/")"
  git tag "${OLD_TAG2}"                                                     # OLD_TAG2=1.15.5-uli-08
  git push --tags
  OLD_TAG="${OLD_TAG2}"                                                     # OLD_TAG=1.15.5-uli-08
}
git rebase "${NEW_BASE}"
git checkout -b "${NEW_ULI}"
git push -u origin "${NEW_ULI}"
NEW_TAG="$(echo "${OLD_TAG}"|sed -e "s/^${OLD_ULI}-/${NEW_ULI}-/")"         # NEW_TAG=1.15.6-uli-08
git tag "${NEW_TAG}"
git push --tags
set +e
