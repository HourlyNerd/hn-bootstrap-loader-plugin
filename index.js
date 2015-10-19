'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

function HNBootstrapPlugin(options) {
    this.options = options || {};
    this.options.out = options.out || "bootstrap_sass";
}

HNBootstrapPlugin.prototype.apply = function (compiler) {
    var self = this;
    var base = path.dirname(self.options.path);
    compiler.plugin('emit', function (compilation, compileCallback) {
        fs.readdirAsync(base).then(function(files){
            return Promise.all(files.map(function(file){
                return self.addFileToAssets(compilation, path.join(base, file));
            }))
        }).catch(function(e){
            console.error('HNBootstrapPlugin: ', e);
        }).then(function(){
            compileCallback();
        });
    });
};


/*
 * Pushes the content of the given filename to the compilation assets
 */
HNBootstrapPlugin.prototype.addFileToAssets = function (compilation, filename) {
    return Promise.props({
        size: fs.statAsync(filename),
        source: fs.readFileAsync(filename)
    })
    .catch(function () {
        throw new Error('HNBootstrapPlugin: could not load file ' + filename);
    })
    .then(function (results) {
        compilation.assets[path.join(this.options.out, path.basename(filename))] = {
            source: function () {
                return results.source;
            },
            size: function () {
                return results.size;
            }
        };
    }.bind(this));
};

module.exports = HNBootstrapPlugin;
