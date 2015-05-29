/*
The MIT License (MIT)
Copyright (c) Patrick Londema <plondema@service2media.com>

Sections by Silas Knobel <dev@katun.ch>:
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

CertDownloader = (function (options) {

    /**
     * CertDownloader([options]).
     * Construct a new CertDownloader.
     * 
     * `options` overrides one or several defaults and should be in JSON format
     * with any of the following options:
     * `certName`: name of the certificate (default is `AppleIncRootCertificate.cer`)
     * `url`     : URL to download the certificate from (default is
     *             `http://www.apple.com/appleca/AppleIncRootCertificate.cer`)
     * `cache`   : path to cache location (a.k.a. where to keep the certificates locally,
     *             default is the directory that the currently executing script resides in)
     */
    function CertDownloader(options) {
        this.certName = 'AppleIncRootCertificate.cer';
        this.fs = require('fs');
        this.http = require('http');
        this.util = require('util');
        this.path = require('path');
        this.rootUrl = 'http://www.apple.com/appleca/AppleIncRootCertificate.cer';
        this.localPath = __dirname;
        if(options) {
            if(options.certName) {
                this.certName = options.certName;
            }
            if(options.url) {
                this.rootUrl = options.url;
            }
            if(options.cache) {
                this.localPath = options.cache;
            }
        }
    }

    /**
     * Retrieve the certificate.
     * 
     * Attempts to download a missing certificate and returns the path to said
     * certificate if available (either cached or downloaded).
     * The callback gets two arguments (err, path), where path is a string to
     * the location of the certificate.
     */
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

    /**
     * Retrieve the certificate in PEM format.
     * 
     * Attempts to download and convert a missing certificate and returns the
     * path to said certificate if available (either cached or converted).
     * The callback gets two arguments (err, path), where path is a string
     * to the location of the certificate.
     */
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