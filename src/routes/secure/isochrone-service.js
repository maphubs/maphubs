//@flow
import request from 'superagent';
var apiDataError = require('../../services/error-response').apiDataError;
var apiError = require('../../services/error-response').apiError;

module.exports = function(app: any) {

  app.post('/api/isochrone', async (req, res) => {
    const data = req.body;
    if(data && data.point){      
      try{
 
        let query = {
          locations: [{
            lat: data.point.lat,
            lon: data.point.lng
          }],
          contours:[{time: 30 ,color:'0000ff'}, {time: 60 ,color:'00ff00'}, {time: 120 ,color:'ff0000'}],
          polygons: true,
          costing: 'auto'
        };
        
        const requestURL = 'https://matrix.mapzen.com/isochrone?json=' + JSON.stringify(query) + '&api_key=' + MAPHUBS_CONFIG.MAPZEN_API_KEY;
        
        const result = await request.get(requestURL).type('json').timeout(60000);

        res.status(200).send(result.body);
      }catch(err){apiError(res, 500)(err);}

    }else{
      apiDataError(res);
    }

  });

};