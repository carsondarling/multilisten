var _ = require('lodash');
var debug = require('debug')('multilisten');
var http = require('http');
var https = require('https');
var url; // Lazy-loaded

module.exports = function start(app, opts) {
  var options = {
    mode: 'redirect',    // [http, https, both, redirect]
    httpPort: 80,
    httpsPort: 443,
    httpsBaseURL: null,
    sslOptions: {}
  };
  options = _.extend(options, opts);

  var httpServer;
  if (options.mode === 'http' || options.mode === 'both') {
    debug('WARNING: Running in non-secure configuration!');
    debug('Creating HTTP Server');
    httpServer = http.createServer(app);

  } else if (options.mode === 'redirect') {
    url = require('url');
    debug('Setting up HTTP->HTTPS redirect');
    httpServer = http.createServer(function(req, res) {
      debug('Redirecting %s to HTTPS', req.url);
      var location = options.httpsBaseURL || 'https://' + req.headers.host;
      location = url.resolve(location, req.url);
      debug(location);
      res.writeHead(301, {Location: location});
      res.end();
    });
  }

  var httpsServer;
  if (options.mode !== 'http') {
    debug('Creating HTTPS Server');
    httpsServer = https.createServer(options.sslOptions, app);
  }

  if (httpServer) httpServer.listen(options.httpPort);
  if (httpsServer) httpsServer.listen(options.httpsPort);

  return {
    http: httpServer,
    https: httpsServer
  };
};
