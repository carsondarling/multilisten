var _ = require('lodash');
var debug = require('debug')('multilisten');
var http = require('http');
var https = require('https');

module.exports = function start(app, opts) {
  var options = {
    mode: 'redirect',    // [http, https, both, redirect]
    httpPort: 80,
    httpsPort: 433,
    sslOptions: {}
  };
  options = _.extend(options, opts);

  var httpServer;
  if (options.mode === 'http' || options.mode === 'both') {
    debug('WARNING: Running in non-secure configuration!');
    debug('Creating HTTP Server');
    httpServer = http.createServer(app);

  } else if (options.mode === 'redirect') {
    debug('Setting up HTTP->HTTPS redirect');
    httpServer = http.createServer(function(req, res) {
      debug('Redirecting %s to HTTPS', req.url);
      res.writeHead(301, {Location: 'https://' + req.headers.host + req.url });
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
};
