#!/usr/bin/env bash

# Batch convert given shapefiles to geojson. Outputs to
# current directory

for var in "$@"
do
  fn=$(basename "$var" .shp)
  ogr2ogr -f GeoJSON ${fn}.json $var
done
