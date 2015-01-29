var saucy = require('./sourcemaps');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var asp = require('rsvp').denodeify;
var uglify = require('uglify-js');

function countLines(str) {
  return str.split(/\r\n|\r|\n/).length;
}

// Process compiler outputs, gathering:
//
//   concatOutputs:         list of source strings to concatenate
//   sourceMapsWithOffsets: list of [absolute offset,
//                                   source map string] pairs
//
//  Takes lists as empty references and populates via push.
function processOutputs(outputs) {
  var offset = 0;

  var outputObj = {};

  var sources = outputObj.sources = [];
  var sourceMapsWithOffsets = outputObj.sourceMapsWithOffsets = [];

  if (!outputs)
    return outputObj;

  outputs.forEach(function(output) {
    var source;
    if (typeof output == 'object') {
      source = output.source || '';
      var offset_ = output.sourceMapOffset || 0;
      var map = output.sourceMap;
      if (map) {
        sourceMapsWithOffsets.push([offset + offset_, map]);
      }
    } 
    else if (typeof output == 'string') {
      source = output;
    }
    else {
      throw "Unexpected output format: " + output.toString();
    }
    source = saucy.removeSourceMaps(source || '');
    offset += countLines(source);
    sources.push(source);
  });

  return outputObj;
}

function createOutput(outputs, outFile, createSourceMaps) {
  var outPath = path.dirname(outFile);

  // process output
  var sourceMap;

  var outputObj = processOutputs(outputs);

  if (createSourceMaps && outputObj.sourceMapsWithOffsets.length)
    sourceMap = saucy.concatenateSourceMaps(outFile, outputObj.sourceMapsWithOffsets, 
        'file:' + path.resolve(outPath));
  
  var output = outputObj.sources.join('\n');

  return {
    source: output,
    sourceMap: sourceMap
  };
}

function minify(output, outFile) {
  var fileName = path.basename(outFile);

  var ast = uglify.parse(output.source, { filename: fileName });
  ast.figure_out_scope();
  ast = ast.transform(uglify.Compressor({ warnings: false }));
  ast.figure_out_scope();
  ast.compute_char_frequency();
  ast.mangle_names({
    except: ['require']
  });

  var sourceMap;
  if (output.sourceMap)
    sourceMap = uglify.SourceMap({
      file: fileName,
      orig: output.sourceMap
    });

  output.source = ast.print_to_string({
    // for some reason non-ascii broke esprima.... this does break unicode though
    ascii_only: true,
    // keep first comment
    comments: function(node, comment) {
      return comment.line == 1 && comment.col == 0;
    },
    source_map: sourceMap
  });
  output.sourceMap = sourceMap && sourceMap.toString();

  return output;
}


exports.writeOutputFile = function(opts, outputs) {
  var output = createOutput(outputs, opts.outFile, opts.sourceMaps);

  if (opts.minify)
    output = minify(output, opts.outFile);

  if (opts.sourceMaps) {
    var sourceMapFile = path.basename(opts.outFile) + '.map';
    output.source += '\n//# sourceMappingURL=' + sourceMapFile;
  }

  return asp(mkdirp)(path.dirname(opts.outFile))
  .then(function() {
    if (!opts.sourceMaps)
      return;
    return asp(fs.writeFile)(path.resolve(path.dirname(opts.outFile), sourceMapFile), output.sourceMap);
  })
  .then(function() {
    return asp(fs.writeFile)(opts.outFile, output.source);
  });

};
