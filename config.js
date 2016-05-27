var exports = module.exports = {};

var config = require('./config.json');

exports.github = {
  host: config.gheHost || 'github.com',
  apiHost: config.gheHost || 'api.github.com',
  protocol: config.gheProtocol || 'http',
  pathPrefix: config.ghePathPrefix,
  port: config.ghePort || 443
};

exports.server = {
	port: config.server.port,
	cachePath: config.fs.cachePath
}

exports.assignFy = {
	maxAssignment: config.assignFy.maxAssignment
}

exports.credentials = {
	USERNAME: config.credentials.username,
	PASSWORD: config.credentials.password
}