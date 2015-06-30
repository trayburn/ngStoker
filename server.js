var express = require('express');
var app = express();

function random (low, high) {
    return Math.random() * (high - low) + low;
}

function randomBool() {
  return Math.round(random(0,1));
}

app.use(express.static('public'));

app.get('/stoker.json', function (req, res) {
  var data = {
    stoker: {
      version: "9.9.9.9",
      sensors: [
        {
          id: "sensor1",
          name: "Brisket",
          tc: Math.round(random(90,100) * 100) / 100,
          al: 1,
          ta: 95,
          th: 100,
          tl: 90,
          blower: null
        },
        {
          id: "sensor2",
          name: "Klose Air",
          tc: Math.round(random(235,275) * 100) / 100,
          al: 1,
          ta: 250,
          th: 275,
          tl: 235,
          blower: "blower1"
        },
        {
          id: "sensor3",
          name: "Weber Air",
          tc: Math.round(random(235,275) * 100) / 100,
          al: 1,
          ta: 250,
          th: 275,
          tl: 235,
          blower: "blower1"
        }
      ],
      blowers: [
        {
          id: "blower1",
          name: "Klose",
          on: randomBool()
        }
      ]
    }
  };

  res.jsonp(data);
});

var port = process.env.port || 4000;

var server = app.listen(port, function () {

  var host = server.address().address;
  console.log('Example app listening at http://%s:%s', host, port);

});
