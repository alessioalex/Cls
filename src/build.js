// In the root:
// npm run-script build

var jsp  = require('uglify-js').parser,
    pro  = require('uglify-js').uglify,
    fs   = require('fs');

function readFiles(callback) {
  var left, clsData, minClsData, copyrightData;

  left = 2;

  fs.readFile(__dirname + '/copyright.js', function (err, data) {
    if (err) throw err;

    copyrightData = data.toString();
    if (!--left) {
      callback(copyrightData, clsData, minClsData);
    }
    // console.log(data.toString());
  });

  fs.readFile(__dirname + '/cls.js', function (err, data) {
    var ast, finalCode;

    if (err) throw err;

    data = data.toString();
    clsData = data;

    ast  = jsp.parse(data);
    ast  = pro.ast_mangle(ast);
    ast  = pro.ast_squeeze(ast);

    minClsData = pro.gen_code(ast);

    if (!--left) {
      callback(copyrightData, clsData, minClsData);
    }
  });
}

function createFiles(clsMain, clsMin, callback) {
  var left = 2;

  function toDo(err) {
    if (err) { throw err; }
    if (!--left) {
      callback();
    }
  }

  fs.writeFile(__dirname + '/../cls.js', clsMain, toDo);
  fs.writeFile(__dirname + '/../cls.min.js', clsMin, toDo);
}

(function build() {

  // build cls.js & cls.min.js
  // add code comments and check them with JSHint
  // travis.yml ?
  readFiles(function(copyrightData, clsData, minClsData) {
    var clsMain, clsMin;

    // copyright + non-minified content
    clsMain = copyrightData + '\n' + clsData;
    // copyright + minified content
    clsMin  = copyrightData + minClsData;
    createFiles(clsMain, clsMin, function() {
      console.log('Build complete.');
    });
  });
}());
