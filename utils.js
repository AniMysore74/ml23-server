const request = require("request");
const MongoClient = require('mongodb').MongoClient;
const database = 'ml23';
const collection = 'places';

var options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  };

const url = 'mongodb://dbuser:dbpass123@ds117178.mlab.com:17178/ml23';

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    else console.log("Connected");
},options);


exports.putCoord = function(unique_id, name, lat, lng, question, answer) {
    
    let body = { 
        unique_id: unique_id,
        name: name,
        location: { type: 'Point', coordinates: [lng,lat ] } 
    }    
    writeToHypertrack(body);

    body.type = 'marker';
    body.question = question;
    body.answer = answer;
    
    writeToMongo(body);
}

exports.putGeofence = function(lat, lng, radius) {
    let body  = { 
        unique_id: 'geofence1',
        name: 'Geofence',
        location: { type: 'Point', coordinates: [lng,lat ] } 
    }
    writeToHypertrack(body);

    body.type = 'geofence';
    body.radius = radius;
    

    writeToMongo(body);
}

exports.getLocs = async function() {
    
    
    geofence = await getGeofenceFromMongo();
    
    places = await getPlacesFromMongo();
    
    return new Promise((resolve, reject) => {

        if(!geofence || !places)
            reject();
        else
            resolve({geofence:geofence, places:places}); 
    })
}

/**
 *  MONGO FUNCTIONS
 * 
 */
 
function writeToMongo(doc) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.db(database).collection(collection).insertOne(doc, function(err, resp) {
            db.close();
            if (err || resp.insertedCount<1 ) {
                err = err?err:"Error!";
                return {suc:false, msg:err};
            }
            else {
                console.log("1 document inserted");
                return {suc:true, msg:'Success'};
            }
        });
    });
}
function getGeofenceFromMongo() {
    return new Promise( (resolve, reject) => { 
        MongoClient.connect(url)
        .then(db => {
            db.db(database).collection(collection).findOne({type:"geofence"})
            .then(r => {
                resolve(r);
            })
        })
        .catch(er=> {
            reject(er);
        });        
    })
}
function getPlacesFromMongo() {
    return new Promise( (resolve, reject) => {
        MongoClient.connect(url)
        .then( db => {
            db.db(database).collection(collection).find({type:"marker"}).toArray()
            .then(r => {
                resolve(r);
            });
        })
        .catch( er => {
            reject(er);
        });
    }) 
}

/**
 * HYPERTRACK FUNCTIONS
 * @param {*} body 
 */
function writeToHypertrack(body) {
    var options = { 
        method: 'POST',
        url: 'https://api.hypertrack.com/api/v2/places/',
        headers: 
        { 
            'Cache-Control': 'no-cache',
            Authorization: 'token sk_65ceafdbcbba345d8ed3c7ca9ab59e5d4b5c6303',
            'Content-Type': 'application/json' 
        },
        body,
        json: true 
    };
  
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
  
    console.log(body);
  });
}

