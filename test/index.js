var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

var fs = require('fs');
var path = require('path');
var request = require('supertest-as-promised');
var multilisten = require('../');

var HTTP_PORT = 5000;
var HTTPS_PORT = 6000;
var HTTP_URL = 'http://localhost:' + HTTP_PORT;
var HTTPS_URL = 'https://localhost:' + HTTPS_PORT;
var requestHTTP = request.bind(request, HTTP_URL);
var requestHTTPS = request.bind(request, HTTPS_URL);

var cert = fs.readFileSync(path.join(__dirname, 'cert.pem'));
var key = fs.readFileSync(path.join(__dirname, 'key.pem'));

// Disable self-signed certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Mock app to send HTTP 200 OK
var app = function(req, res) {
  res.end();
};

describe('multilisten', function() {
  it('should export a function', function() {
    multilisten.should.be.a('function');
  });

  describe('mode http', function() {
    var s;
    before(function() {
      s = multilisten(app, {
        mode: 'http',
        httpPort: HTTP_PORT,
        httpsPort: HTTPS_PORT
      });
    });

    after(function(done) {
      if (!s.http) return done();
      s.http.close(done);
    });

    after(function(done) {
      if (!s.https) return done();
      s.https.close(done);
    });

    it('should listen on http', function() {
      return requestHTTP().get('/')
        .expect(200)
        .should.be.fulfilled;
    });

    it('should not listen on https', function() {
      return requestHTTPS()
        .get('/')
        .should.be.rejected;
    });
  });

  describe('mode https', function() {
    var s;
    before(function() {
      s = multilisten(app, {
        mode: 'https',
        httpPort: HTTP_PORT,
        httpsPort: HTTPS_PORT,
        sslOptions: {
          cert: cert,
          key: key
        }
      });
    });

    after(function(done) {
      if (!s.http) return done();
      s.http.close(done);
    });

    after(function(done) {
      if (!s.https) return done();
      s.https.close(done);
    });

    it('should not listen on http', function() {
      return requestHTTP().get('/')
        .should.be.rejected;
    });

    it('should listen on https', function() {
      return requestHTTPS()
        .get('/')
        .should.be.fulfilled;
    });
  });

  describe('mode both', function() {
    var s;
    before(function() {
      s = multilisten(app, {
        mode: 'both',
        httpPort: HTTP_PORT,
        httpsPort: HTTPS_PORT,
        sslOptions: {
          cert: cert,
          key: key
        }
      });
    });

    after(function(done) {
      if (!s.http) return done();
      s.http.close(done);
    });

    after(function(done) {
      if (!s.https) return done();
      s.https.close(done);
    });

    it('should listen on http', function() {
      return requestHTTP().get('/')
        .should.be.fulfilled;
    });

    it('should listen on https', function() {
      return requestHTTPS()
        .get('/')
        .should.be.fulfilled;
    });
  });

  describe('mode redirect', function() {
    var s;
    before(function() {
      s = multilisten(app, {
        mode: 'redirect',
        httpPort: HTTP_PORT,
        httpsPort: HTTPS_PORT,
        sslOptions: {
          cert: cert,
          key: key
        }
      });
    });

    after(function(done) {
      if (!s.http) return done();
      s.http.close(done);
    });

    after(function(done) {
      if (!s.https) return done();
      s.https.close(done);
    });

    it('should redirect http', function() {
      return requestHTTP().get('/')
        .expect(301)
        .then(function(res) {
          res.headers.should.have.property('location');
          res.headers.location.should.equal('https://localhost:' + HTTPS_PORT + '/');
        })
        .should.be.fulfilled;
    });

    it('should listen on https', function() {
      return requestHTTPS()
        .get('/')
        .should.be.fulfilled;
    });
  });

  describe('mode redirect with base url', function() {
    var baseURL = 'https://localhost:4000';
    var s;
    before(function() {
      s = multilisten(app, {
        mode: 'redirect',
        httpPort: HTTP_PORT,
        httpsPort: HTTPS_PORT,
        httpsBaseURL: baseURL,
        sslOptions: {
          cert: cert,
          key: key
        }
      });
    });

    after(function(done) {
      if (!s.http) return done();
      s.http.close(done);
    });

    after(function(done) {
      if (!s.https) return done();
      s.https.close(done);
    });

    it('should redirect http using the base URL', function() {
      return requestHTTP().get('/blah')
        .expect(301)
        .then(function(res) {
          res.headers.should.have.property('location');
          res.headers.location.should.equal(baseURL + '/blah');
        })
        .should.be.fulfilled;
    });

    it('should listen on https', function() {
      return requestHTTPS()
        .get('/')
        .should.be.fulfilled;
    });
  });
});
