require('should');
var multilisten = require('./');


var app = function(req, res) {
  res.end();
};

describe('multilisten', function() {

  it('should export a function', function() {
    multilisten.should.be.a.Function();
  });

  describe('mode http', function() {

    it ('should listen on http', function(done) {
      multilisten(app, {mode: 'http', httpPort: 5000});


    });

  });

});
