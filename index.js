'use strict';

var CertDownloader;

CertDownloader = (function (certName, options) {
    function CertDownloader(certName, options) {
        this.certName = certName ? certName : 'AppleIncRootCertificate.cer';
        this.fs = require('fs');
        this.http = require('http');
        this.util = require('util');
        this.path = require('path');
        this.rootUrl = 'http://www.apple.com/appleca/AppleIncRootCertificate.cer';
        this.localPath = __dirname;
        
        if(options) {
            if(options.rootUrl) {
                this.rootUrl = options.rootUrl;
            }
            if(options.localPath) {
                this.localPath = options.localPath;
            }
        }
    }

    CertDownloader.prototype.cert = function (callback) {
        return this.fs.exists(this.path.join(this.localPath, this.certName),(function (_this) {
            return function (exists) {
                if (exists) {
                    return callback(null, _this.path.join(_this.localPath, _this.certName));
                } else {
                    return _this.http.get(_this.rootUrl, function (response) {
                        var downloadStream = _this.fs.createWriteStream(_this.path.join(_this.localPath, _this.certName));
                        response.pipe(downloadStream);
                        return downloadStream.on('finish', function () {
                            return downloadStream.close(function () {
                                return callback(null, _this.path.join(_this.localPath, _this.certName));
                            });
                        });
                    }).on('error', function(error) {
                        return callback(error);
                    });
                }
            };
        })(this));
    };

    CertDownloader.prototype.pem = function (callback) {
        var pemFileName = this.util.format('%s.pem', this.certName.split('.')[0]);
        return this.fs.exists(this.path.join(this.localPath, pemFileName),(function (_this) {
            return function (exists) {
                if (exists) {
                    return callback(null, _this.path.join(_this.localPath, pemFileName));
                } else {
                    return _this.cert(function (error, certPath) {
                        if(error) {
                            return callback(error);
                        }
                        var exec, execOptions;
                        exec = require('child_process').exec;
                        execOptions = {
                            cwd: _this.localPath
                        };
                        var cmd = _this.util.format(
                            'openssl x509 -inform der -in %s -out %s',
                            _this.certName,
                            pemFileName);
                        return exec(cmd, execOptions, function (error) {
                            if (error) {
                                return callback(error);
                            } else {
                                return callback(null, _this.path.join(_this.localPath, pemFileName));
                            }
                        });
                    });
                }
            };
        })(this));
    };

    return CertDownloader;

})();

module.exports = CertDownloader;