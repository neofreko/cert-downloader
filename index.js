/*
The MIT License (MIT)
Copyright (c) Patrick Londema <plondema@service2media.com>

Based on work by
The MIT License (MIT)
Copyright (c) Silas Knobel <dev@katun.ch> (http://katun.ch)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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