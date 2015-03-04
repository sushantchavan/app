/**
 * Module dependencies.
 */

var express = require('express');
var forgotpassword = require('./lib/forgotpassword');

/**
 * Exports Application
 */

var app = module.exports = express();

/**
 * Define routes for Forgot Password module
 */

app.post('/', function(req, res, next) {
  var meta = {
    ip: req.ip,
    ips: req.ips,
    host: req.get('host'),
    origin: req.get('origin'),
    referer: req.get('referer'),
    ua: req.get('user-agent')
  };

  forgotpassword.createToken(req.body.email, meta, function (err) {
    if (err) {
      // FIXME: horrible hack for #610. Find a final solution and apply.
      if (err.status) {
        // FIXME: needed this special error code for redirection
        return res.json(500, { error: err.message, status: err.status });
      } else {
        // FIXME: user just doesn't exist. Not a server error
        return res.json(200, { error: err.message } )
      }
    }

    return res.json(200);
  })
});

app.post('/verify', function(req, res, next) {
  forgotpassword.verifyToken(req.body.token, function (err) {
    if (err) return res.json(500, { error: err.message });

    return res.json(200);
  })
});

app.post('/reset', function(req, res, next) {
  forgotpassword.resetPassword(req.body, function (err, citizen) {
    if (err) return res.json(500, { error: err.message });

    req.login(citizen, function(err) {
      if (err) return res.json(500, { error: err.message });

      return res.json(200);
    });
  });
});