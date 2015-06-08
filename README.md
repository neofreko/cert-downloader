# cert-downloader [![Build Status](https://travis-ci.org/evi-snowm/cert-downloader.svg?branch=develop)](https://travis-ci.org/evi-snowm/cert-downloader)

This is a helper module that allows you to download an SSL certificate, by default that of Apple Inc..

Offered functionality:
* Download certificate and store locally.
* Convert certificate to PEM format.
* Validate a file against the certificate.

More information and links to source code: [http://evi-snowm.github.io/cert-downloader/](http://evi-snowm.github.io/cert-downloader/)

**NOTE** OpenSSL or compatible must be installed on your system if you wish to use certificates in the PEM format.
Without this tool, only the download function will work.

## Install
```sh
$ npm install cert-downloader
```

## Usage

```js
var CertDownloader = require('cert-downloader');
var certDl = new CertDownloader();

// download and save in default (cache) location
certDl.cert(function (error, certificatePath) {
    if(error) {
        console.error('Error ' + error);
    } else {
        console.log('Certificate downloaded to ' + certificatePath);
        // /nodeproject/certificate/AppleIncRootCertificate.cer
    }
});

// download and convert to PEM (will use cached cer file and convert that to pem)
certDl.pem(function (error, certificatePath) {
    if(error) {
        console.error('Error ' + error);
    } else {
        console.log('Certificate downloaded to ' + certificatePath);
        // /nodeproject/certificate/AppleIncRootCertificate.pem
    }
});

// verifiy an existing file against the certificate
// (will download and convert if required)
var file = '/nodeproject/certificate/file-to-verify';
certDl.verify(file, function(error, output) {
    if(error){
      return callback('File verification failed: ' + error);
    }
    console.log('Verified output: ' + output);
  });
```

##API

###CertDownloader([options])
Construct a new CertDownloader.
 
You will always need to call this first. `options` Overrides one or several defaults and should be in JSON format with any of the following options:

 * `certName`: name of the certificate (default is `AppleIncRootCertificate.cer`)
 * `url`     : URL to download the certificate from (default is `http://www.apple.com/appleca/AppleIncRootCertificate.cer`)
 * `cache`   : path to cache location (a.k.a. where to keep the certificates locally, by default this is the operating system's default directory for temp files)

###cert(callback)
Retrieve the certificate.

Attempts to download a missing certificate and returns the path to said certificate if available (either cached or downloaded). The callback gets two arguments (err, path), where path is a string to the location of the certificate.

###pem(callback)
Retrieve the certificate in PEM format.

Attempts to download and convert a missing certificate and returns the path to said certificate if available (either cached or converted). The callback gets two arguments (err, path), where path is a string to the location of the certificate.

###verify(file, callback)
Verifies a file against the certificate.

Attempts to download and convert a missing certificate and returns the content of the file if successfully verified. The callback gets two arguments (err, output), where output is the content of the file if successfully verified.


## License

MIT © Patrick Londema