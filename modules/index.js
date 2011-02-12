//Loads all modules in current directory

require.paths.unshift('modules');
var fs = require('fs');

var modules = fs.readdirSync("modules"),
    moduleMap = {};



for(var i = 0; i < modules.length; i++) {

  if(modules[i] === "index.js" || modules[i] === "core.js") continue;
  var modName = modules[i].substring(0, modules[i].length - 3);
  var currentModule = exports[modName] = require(modName);
  
  if(currentModule.types) {
    for(var i = 0; i < currentModule.types.length; i++) {
      moduleMap[currentModule.types[i]] = modName;
    }
  }
}

exports._moduleMap = moduleMap;
