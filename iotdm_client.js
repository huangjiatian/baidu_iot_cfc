var util = require('util');
var u = require('underscore');
var qs = require('querystring');

var H = require('./node_modules/bce-sdk-js/src/headers');
var Auth = require('./node_modules/bce-sdk-js/src/auth.js');
var HttpClient = require('./node_modules/bce-sdk-js/src/http_client');
var BceBaseClient = require('./node_modules/bce-sdk-js/src/bce_base_client');

function IotdmClient(config) {
    BceBaseClient.call(this, config, 'tsdb', true);
    this._httpAgent = null;
}
util.inherits(IotdmClient, BceBaseClient);

IotdmClient.prototype.updateProfile = function (deviceName, body, options) {
    options = options || {};
    var url = `/v3/iot/management/device/${deviceName}`;
    var params = {
        updateProfile: ''
    };
    var headers = {};
    headers[H.CONTENT_TYPE] = 'application/json; charset=UTF-8';

    return this.sendRequest('PUT', url, {
        headers: headers,
        body: JSON.stringify(body),
        params,
        config: options.config
    });
}

IotdmClient.prototype.createSignature = function (credentials, httpMethod, path, params, headers) {
    var auth = new Auth(credentials.ak, credentials.sk);
    // 不能对content-type,content-length,content-md5进行签名
    // 不能对x-bce-request-id进行签名
    var headersToSign = ['host'];

    return auth.generateAuthorization(httpMethod, path, params, headers, 0, 0, headersToSign);
};

IotdmClient.prototype.sendRequest = function (httpMethod, resource, varArgs) {
    var defaultArgs = {
        body: null,
        headers: {},
        params: {},
        config: {},
        outputStream: null
    };
    var args = u.extend(defaultArgs, varArgs);
    var config = u.extend({}, this.config, args.config);
    var client = this;
    var agent = this._httpAgent = new HttpClient(config);
    var httpContext = {
        httpMethod: httpMethod,
        resource: resource,
        args: args,
        config: config
    };
    u.each(['progress', 'error', 'abort'], function (eventName) {
        agent.on(eventName, function (evt) {
            client.emit(eventName, evt, httpContext);
        });
    });

    return this._httpAgent.sendRequest(httpMethod, resource, args.body,
        args.headers, args.params, u.bind(this.createSignature, this),
        args.outputStream
    );
}

module.exports = IotdmClient;