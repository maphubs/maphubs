//@flow
var knex = require('../../connection');
var log = require('../../services/log');
module.exports = function(app: any) {

  app.get('/healthcheck',  (req, res) => {
    if(knex){
      knex.select(knex.raw('version()')).then(()=>{
       res.status(200).send('OK');
      })
      .catch((err) => {
        log.error(err.message);
        res.status(500).send();
      });
    }  
    else{
      res.status(500).send();
    }
  });

};