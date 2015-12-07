//var socket1 = io('https://192.168.173.1:80');
var socket1 = io.connect(); 

var ts = timesync.create({
    server: socket1,
    interval: 1000
  });

ts.on('sync', function (state) {
  // console.log('sync ' + state);
});

ts.on('change', function (offset) {
  /*
  console.log('changed offset: ' + offset + ' ms');
  var now = Date.now(ts.now());
  console.log('now: ' + now + ' ms');
  /**/

});

ts.send = function (socket, data) {
  //console.log('send', data);
  socket1.emit('timesync', data);
};

socket1.on('timesync', function (data) {
  // console.log('receive', data);
  ts.receive(null, data);
});