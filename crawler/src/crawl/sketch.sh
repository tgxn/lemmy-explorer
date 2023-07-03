#!/bin/bash
# Parses all kbin magazines listed on a given instance
# Pass the results to 'grep -v @' to filter out magazines on other instances

INSTANCE=$1

if [ -z $INSTANCE ]; then
    echo "Provide an instance as the only parameter (like kbin.social)"
    exit 1
fi

function parse() {
    PAGE=$1
    curl -m 10 --fail -s https://${INSTANCE}/magazines?p=$PAGE | grep form | grep '/subscribe' | sed 's/.*="\/m\/\(.*\)\/subscribe"/\1/g'
    return ${PIPESTATUS[0]}
}

for idx in $(seq 10000); do
    if ! parse $idx; then
        break
    fi
done
