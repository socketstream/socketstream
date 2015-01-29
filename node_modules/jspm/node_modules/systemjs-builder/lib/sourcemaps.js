var sourceMap = require('source-map');
var traceur = require('traceur');
var path = require('path');

var isWin = process.platform.match(/^win/);

var wrapSourceMap = function(map) {
  return new sourceMap.SourceMapConsumer(map);
};

var sourceMapRegEx = /\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n'"]+)/;
exports.removeSourceMaps = function(source) {
  return source.replace(sourceMapRegEx, '');
};

exports.concatenateSourceMaps = function(sourceFilename, mapsWithOffsets, outPath) {
  var generated = new sourceMap.SourceMapGenerator({
    file: sourceFilename
  });

  mapsWithOffsets.forEach(function(pair) {
    var offset = pair[0];
    var mapSource = pair[1];
    var map;
    try {
      map = JSON.parse(mapSource);
    } catch (error) {
      throw new Error(mapSource + ": Invalid JSON");
    }

    // this is odd, sourceRoot is redundant (and causes doubling)
    map.sourceRoot = '';

    wrapSourceMap(map).eachMapping(function(mapping) {
      if (mapping.source.match(/^@traceur/)) {
        return;
      }

      generated.addMapping({
        generated: {
          line: offset + mapping.generatedLine,
          column: mapping.generatedColumn
        },
        original: {
          line: mapping.originalLine,
          column: mapping.originalColumn
        },
        source: mapping.source
      });

      originalLastLine = mapping.generatedLine;
    });
  });

  if (outPath) {
    // convert from library internals format to canonical
    var normalized = JSON.parse(JSON.stringify(generated));
    // convert paths to relative
    normalized.sources = normalized.sources.map(function(source) {
      if (isWin)
        return path.relative(outPath, source).replace(/\\/g, '/');
      else
        return path.relative(outPath, source);
    });
    return JSON.stringify(normalized);
  }

  return generated.toString();
};
