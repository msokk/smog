/**
 * Smog Module loader
 * @description Loads modules in folder
 */
require.paths.unshift('modules');

var fs = require('fs'),
    modules = fs.readdirSync("modules"),
    clientModules = fs.readdirSync("public/modules"),
    moduleMap = {};

exports.module = {};


for(var i = 0; i < modules.length; i++) {
  if(modules[i] === "index.js" || modules[i] === "core.js") {
    continue;
  }
  
  var modName = modules[i].substring(0, modules[i].length - 3);
  var currentModule = exports.module[modName] = require(modName);
  if(currentModule.types) {
    for(var u = 0; u < currentModule.types.length; u++) {
      moduleMap[currentModule.types[u]] = modName;
    }
  }
}


exports.clientModules = clientModules;
exports.moduleMap = moduleMap;