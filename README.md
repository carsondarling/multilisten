# Multilisten

Multilisten makes it super easy to listen on both HTTP and HTTPS, using the same
app instance.

## Example Usage

```javascript
var app = function(req, res) {
  res.end('Hello World');
};

multilisten(app, {
  mode: 'redirect',
  sslOptions: {
    cert: '<certificate>',
    key: '<key>'
  }
});

/**
 * App is now listening on both ports 80 and 443, and will automatically
 * redirect from HTTP to HTTPS.
 */
```

## API

### multilisten(app, options)

#### app

`app` is any Javascript function that can serve as a request listener, with the signature:

```javascript
function(request, response) { }
```

The app exposed by [Express](expressjs.com) is fully compatible, so Multilisten will work with any Express-based application with minimal modification.

#### options

**options.httpPort** The port for the HTTP server to listen on. Default 80

**options.httpsPort** The port for the HTTPS server to listen on. Default 443

**options.sslOptions** Options for the HTTPS server, passed directly to Node's HTTPS module

**options.httpsBaseURL** The base URL to redirect HTTP requests to

If this is not specified, only the protocol will be changed (e.g. `http://domain.com/blah` will be redirected to `https://domain.com/blah`, ignoring ports).

If it is specified (e.g. with `https://domain.com:8443`), a the path will be appended (e.g. `http://domain:8000/blah` will be redirected to `https://domain.com:8443`). Please be careul to include HTTPS in the base URL, otherwise it is possible to redirect to an unsecure endpoint.

**options.mode**

The mode determines which servers Multilisten will use to listen, and how they will respond. There are 4 possible modes: `http`, `https`, `both`, and `redirect`. Default `redirect`

|    Mode    |   HTTP Response   |  HTTPS Response  |       Description        |
|------------|-------------------|------------------|--------------------------|
| `http`     | Handled by `app`  | Disabled         | Listen on HTTP only      |
| `https`    | Disabled          | Handled by `app` | Listen on HTTPS only     |
| `both`     | Handled by `app`  | Handled by `app` | Use either HTTP or HTTPS |
| `redirect` | Redirect to HTTPS | Handled by `app` | Force HTTPS (default)    |
