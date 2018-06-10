const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const utils = require("./utils.js")


app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'))

// Put coordinates into hypertrack
app.post('/putCoord', (req,res) => {    
    console.log("putCoord\n"+  req.body);
    let p = req.body;

    if(!p.unique_id || !p.name || !p.lat || !p.lng || !p.question || !p.answer || !p.clue) 
        res.status(500).send('Error! Insufficent parameters');
    else {
        try {
            utils.putCoord(p.unique_id, p.name, p.lat, p.lng, p.question, p.answer,p.clue);
            res.send('Posted!');
        }
        catch(Error){
            res.status(500).send(Error);
        }         
    } 
}) 

// 
app.post('/putGeofence', (req,res) => { 
    console.log("putGeofence\n" + req.body);
    let p = req.body;
    
    if(!p.lat || !p.lng || !p.radius)
        res.status(500).send('Error! Insufficient parameters');
    else {
        utils.putGeofence(p.lat,p.lng,p.radius);
        res.send('Posted!');
    }
})

app.post('/putPolygonalGeofence', (req,res) => { 
    console.log("putPolygonalGeofence\n" + req.body);
    let p = req.body;
    
    if(!p.coords || !p.coords[0] || !p.coords[4] || !p.coords[0].lat || !p.coords[0].lng)
        res.status(500).send('Error! Insufficient parameters');
    else {
        utils.putPolygonalGeofence(p.coords);
        res.send('Posted!');
    }
})

//Get Locations + associated data, center & radius of geofence 
app.get('/getLocs', (req,res)=> { 
    console.log("getLocs");
    utils.getLocs()
    .then(r => res.send(r))
    
    .catch(er => res.status(500).send('Error'))
})

app.get('/reset', (req,res) => {
    console.log("Going for a toss!");
    utils.reset()
    .then(r => res.send(r+' Going for a toss!'))
    .catch(er => res.status(500).send('Error'))

})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

