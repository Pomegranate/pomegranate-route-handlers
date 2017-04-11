/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-route-handlers
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const util = require('magnum-plugin-utils')
const _ = require('magnum-plugin-utils').lodash

/**
 *
 * @module index
 */

exports.options = {
  workDir: './routeHandlers'
}

exports.metadata = {
  name: 'RouteHandlers',
  type: 'service',
  param: 'Handlers',
  depends: ['Controllers'],
  provides: ['PreRouter']
}

exports.plugin = {
  load: function(inject, loaded) {

    function replacePaths(thing){
      if(_.isObject(thing)){
        let keys = Object.keys(thing)
        return _.mapValues(thing, function(prop){
          return replacePaths(prop)
        })
      }
      if(_.isString(thing)){
        return inject(require(thing))
      }
    }

    util.fileListNested(this.options.workDir)
      .then((files) => {
        flatten(files).forEach((p)=>{
          this.Logger.log(`Loading route handler at: Handlers.${p}`)
        })

        let routeHandlers = replacePaths(files)
        loaded(null, routeHandlers)
      })

  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}


function flatten(obj, opt_out, opt_paths) {
  let out = opt_out || [];
  let paths = opt_paths || [];
  return Object.keys(obj)
    .reduce(function(out, key) {
      paths.push(key);
      if (_.isObject(obj[key])) {
        flatten(obj[key], out, paths);
      } else {
        out.push(paths.join('.'))
      }
      paths.pop();
      return out;
    }, out)
}