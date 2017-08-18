/* eslint-disable no-console*/
/* eslint-disable unicorn/no-process-exit*/
require('babel-register')({
  "presets": [
    "env",
    "react"
  ],
  "plugins": ["transform-flow-strip-types"],
});

var Layer = require('../src/models/layer');
var LayerViews = require('../src/services/layer-views');
var knex = require('../src/connection');

if(process.argv.length !== 3){
  console.log('Please provide the layer_id to recreate');
  process.exit(1);
}else{
  try{
    let layer_id = parseInt(process.argv[2]);
  
    console.log(`Recreating views for layer: ${layer_id}`);

    knex.transaction((trx) => {
      return Layer.getLayerByID(layer_id, trx)
      .then(layer=>{
        return LayerViews.replaceViews(layer_id, layer.presets, trx)
        .then(()=>{
          return Layer.setUpdated(layer_id, 1, trx)
          .then(() => {
            console.log('SUCCESS!');
            return;
          });
        });
      });
    })
    .then(()=>{
      return process.exit();
    })
    .catch(err=>{
      console.log(err);
      process.exit(1);
    });
  }catch(err){
    console.log(err);
    process.exit(1);
  }
}