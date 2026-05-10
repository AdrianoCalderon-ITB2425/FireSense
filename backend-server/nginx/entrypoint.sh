#!/bin/sh
set -e
echo "=== Generating config files ==="
envsubst '${INFLUX_TOKEN} ${CHIRPSTACK_KEY} ${MAPTILER_KEY} ${CESIUM_TOKEN}' \
  < /usr/share/nginx/html/js/config.js.template \
  > /usr/share/nginx/html/js/config.js
echo "✓ firesense/config.js"
envsubst '${INFLUX_TOKEN} ${CHIRPSTACK_KEY} ${MAPTILER_KEY} ${CESIUM_TOKEN}' \
  < /usr/share/nginx/html/js/map.js.template \
  > /usr/share/nginx/html/js/map.js
echo "✓ firesense/map.js"
envsubst '${INFLUX_TOKEN} ${CHIRPSTACK_KEY} ${MAPTILER_KEY} ${CESIUM_TOKEN}' \
  < /usr/share/nginx/html-firesense/js/config.js.template \
  > /usr/share/nginx/html-firesense/js/config.js 2>/dev/null || echo "skip firesense/config.js"
envsubst '${INFLUX_TOKEN} ${CHIRPSTACK_KEY} ${MAPTILER_KEY} ${CESIUM_TOKEN}' \
  < /usr/share/nginx/html-firesense/js/map.js.template \
  > /usr/share/nginx/html-firesense/js/map.js 2>/dev/null || echo "skip firesense/map.js"
envsubst '${INFLUX_TOKEN} ${CHIRPSTACK_KEY} ${MAPTILER_KEY} ${CESIUM_TOKEN} ${MAPBOX_TOKEN}' \
  < /usr/share/nginx/html/js/rf_coverage.js.template \
  > /usr/share/nginx/html/js/rf_coverage.js
envsubst '${INFLUX_TOKEN} ${CHIRPSTACK_KEY} ${MAPTILER_KEY} ${CESIUM_TOKEN} ${MAPBOX_TOKEN}' \
  < /usr/share/nginx/html-firesense/js/rf_coverage.js.template \
  > /usr/share/nginx/html-firesense/js/rf_coverage.js 2>/dev/null || echo "skip firesense/rf_coverage.js"
exec nginx -g 'daemon off;'
