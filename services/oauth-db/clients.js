var knex = require('../../connection.js');
var log = require('../log.js');

function translateClientObject(data){

    //map the OSM object over to the format expected by Passport/oauthorize librariess
    //#TODO:30 add support for controlling client permissions from OSM database
    var client = {
        id: data.id,
        name: data.name,
        consumerKey: data.key,
        consumerSecret: data.secret,
        callbackURL: data.callback_url
    }

    return client;
}

exports.find = function(id, done) {

    knex.select('*')
        .from('client_applications')
        .where('id', id)
        .then(function (data) {
            if(data.length == 1){
                var client = translateClientObject(data[0]);
                return done(null, client);
            }else{
                //not found
                return done('Client Not Found', null);
            }

        }).catch(function (err) {
            log.error(err);
            return done(err, null);
        });

};

exports.findByConsumerKey = function(consumerKey, done) {

    knex.select('*')
        .from('client_applications')
        .where('key', consumerKey)
        .then(function (data) {
            if(data.length == 1){
                var client = translateClientObject(data[0]);
                return done(null, client);
            }else{
                //not found
                return done('Client Not Found', null);
            }

        }).catch(function (err) {
            log.error(err);
            return done(err, null);
        });

};
