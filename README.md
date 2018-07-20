# Pluralsight Scraper

## Functionality

Download an entire Pluralsight course.

## Purpose

There are many unsupported platforms for Pluralsight. As an example, it may be nice to download a video and play it on a device that doesn't have a Pluralsight app.

## Dependencies

[nightmare](https://github.com/segmentio/nightmare) is used for simulating a browser. This is needed for logging in, finding the course videos, and downloading them.

[system-sleep] (https://github.com/jochemstoel/nodejs-system-sleep) is used to throttle downloading.

## Usage

Modify `index.js`. You will need to provide your email/password, the URL for the course you wish to download, and optionally change the sleep time to fit your needs.

    git clone https://github.com/ryanjerskine/pluralsight-scraper
    npm install
    npm start
	
## Terms of Service

Using this scraper with your Pluralsight account is against the Pluralsight terms of service. This repo should only be used as an educational resource to observe how
Nightmare can be used on a real website.
