# Avanor

Avanor is a platform for viewing and analysing satellite imagery related to avalanches.

## Dependencies

This is not a complete list.

* Earth Engine account with connected project accounts
* ESA Scihub account
* `nodejs`
* `npm`
* `ansible`

## System requirements

The orthorectification machines needs at least 32 GiB primary memory.

## Credentials files

* `ee.creds`
  * Refresh token generated via [these instructions](https://developers.google.com/earth-engine/python_install_manual#setting-up-authentication-credentials)
* `privatekey-edit.json`
  * Private project key obtained through the Google Cloud Console, with write access to bucket and Earth Engine project
* `privatekey-read.json`
  * Private project key obtained through the Google Cloud Console, with read access to bucket and Earth Engine project
* `scihub.creds`
  * ESA Scihub credentials on the form `username:password`
* `track.id`
  * Google analytics tracking ID

## Installation

### Web server

    cd node
    npm install
    npm run build
    npm start

### Orthorectification server

From another machine, `x.x.x.x` is the IP of target server:

    cd provision/calib
    ./provision x.x.x.x
    ./update x.x.x.x
