'use strict'

var
    config = require('./config'),
    request = require('request');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ? (process.env.MESSENGER_VALIDATION_TOKEN) : config.MESSENGER_VALIDATION_TOKEN;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN) : config.PAGE_ACCESS_TOKEN;

/*
 * Add a get started button
 * 
 */
var getStarted = function() {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: {
            access_token: PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
            "get_started": {
                "payload": "GET_STARTED"
            }
        }

    }, function(error, response, body) {
        // console.log(response)
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })

}

/*
 * Add persistent menu
 *  
 */
var addPersistentMenu = function() {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: {
            access_token: PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
            "persistent_menu": [{
                "locale": "default",
                "call_to_actions": [{
                    "type": "postback",
                    "title": "Another recipe",
                    "payload": "MENU_ANOTHER"
                }, {
                    "type": "postback",
                    "title": "Random recipe",
                    "payload": "MENU_RANDOM"
                }, {
                    "type": "postback",
                    "title": "Help",
                    "payload": "MENU_HELP"
                }]
            }]
        }

    }, function(error, response, body) {
        // console.log(response)
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })

}

module.exports = {
    getStarted: getStarted,
    addPersistentMenu: addPersistentMenu
}