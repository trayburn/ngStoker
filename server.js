var uuid = require('node-uuid');
var express = require('express');
var app = express();
var idCache = {};

// ************************************************************************
// Helper Functions
// ************************************************************************
function random (low, high) {
    return Math.random() * (high - low) + low;
}

function randomBool(percent) {
  var val = Math.round(random(1,100));

  if (val > percent) { return 0; }
  else { return 1; }
}

function newBlower(name, percent) {
  if (typeof idCache[name] == 'undefined') { idCache[name] = uuid.v4(); }

  return {
    id: idCache[name],
    name: name,
    on: randomBool(percent)
  }
}
function newAirSensor(name, blower) {
  if (typeof idCache[name] == 'undefined') { idCache[name] = uuid.v4(); }

  return {
    id: idCache[name],
    name: name,
    tc: Math.round(random(245,265) * 100) / 100,
    al: 1,
    ta: 250,
    th: 275,
    tl: 235,
    blower: blower
  };
}

function newFoodSensor(name) {
  if (typeof idCache[name] == 'undefined') { idCache[name] = uuid.v4(); }

  return {
    id: idCache[name],
    name: name,
    tc: Math.round(random(185,195) * 100) / 100,
    al: 1,
    ta: 190,
    th: 200,
    tl: 180,
    blower: null
  };
}
// ************************************************************************
// Routes
// ************************************************************************


/* Don't break my bookmarks which used this old address */
app.get('/public', function (req, res) {
  res.redirect('/');
});

/* Serve up static content from the public folder */
app.use(express.static('public'));

/* respond to calls to stoker.json with JSONP response */
app.get('/stoker.json', function (req, res) {
  var data = {
    stoker: {
      version: "TEST MODE",
      sensors: [
        newFoodSensor("Brisket"),
        newFoodSensor("Pulled Pork"),
        newFoodSensor("Chicken"),
        newAirSensor("Klose Air", "blower1"),
        newAirSensor("Weber 18 Air", "blower2")
      ],
      blowers: [
        newBlower("Klose", 65),
        newBlower("Weber 18", 80)
      ]
    }
  };

  res.jsonp(data);
});

// ************************************************************************
// Express Server
// ************************************************************************

var port = process.env.port || 4000;
var server = app.listen(port, function () {
  var host = server.address().address;
  console.log('Example app listening at http://%s:%s', host, port);
});
