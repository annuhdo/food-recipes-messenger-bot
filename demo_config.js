'use strict';

// Wit.ai parameters
const WIT_TOKEN = process.env.WIT_TOKEN;
if (!WIT_TOKEN) {
    WIT_TOKEN = "WIT TOKEN HERE";
};

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN);
if (!VALIDATION_TOKEN) {
	VALIDATION_TOKEN = "VALIDATION TOKEN HERE";
}

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN);
if (!PAGE_ACCESS_TOKEN) {
	PAGE_ACCESS_TOKEN = "PAGE ACCESS TOKEN HERE";
}

// Reddit configuration
const REDDIT_CONFIG = {
    REDDIT_USER: 'USERNAME HERE',
    REDDIT_KEY: 'KEY HERE',
    REDDIT_SECRET: 'SECRET HERE',
    REDDIT_PW: 'PASSWORD HERE'
}

module.exports = {
    WIT_TOKEN: WIT_TOKEN,
    VALIDATION_TOKEN: VALIDATION_TOKEN,
    PAGE_ACCESS_TOKEN: PAGE_ACCESS_TOKEN,
    REDDIT_CONFIG: REDDIT_CONFIG
}