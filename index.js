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
    if (!url) url = require('url');
    debug('Setting up HTTP->HTTPS redirect');
    httpServer = http.createServer(function(req, res) {
      debug('Redirecting %s to HTTPS', req.url);

      var location;
      if (options.httpsBaseURL) {
        location = options.httpsBaseURL;
      } else {
        location = url.format({
          protocol: 'https',
          port: options.httpsPort,
          hostname: req.headers.host.split(':')[0]
        });
      }

      location = url.resolve(location, req.url);
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
