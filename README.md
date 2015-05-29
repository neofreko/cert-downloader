# cert-downloader
(Apple) SSL Certificate downloader

Downloads and optionally converts an SSL certificate.

This is a helper module that allows you to dowload an SSL certificate, by default that of Apple Inc.
Output in in either CER or PEM format.

**NOTE** OpenSSL or compatible must be installed on your system if you wish to use certificated in the PEM format.
This is currently UNTESTED work in progress.

## Install
Will work soon(ish).

```sh
$ npm install --save cert-downloader
```

## Usage

```js
var CertDownloader = require('cert-downloaded');
var certDl = new CertDownloader();

// download and save in default cache location
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
```

## License

MIT © Patrick Londema