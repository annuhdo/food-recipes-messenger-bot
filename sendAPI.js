'use strict';

var
    type = "",
    Recipes = require('./Recipes'),
    Search = require('./Search'),
    config = require('.config'),
    request = require('request');


/*
 * Send the recipe
 *
 */
var sendRecipe = function(sender, text) {
    var recipe;
    var gif;
    var fileExt;
    var title;
    var permalink;
    var gifQuery;

    do {
        if (Recipes.getLength() == 0) {
            return sendTypingOn(sender, "Hm, I couldn't find any random recipe for today :(");
        }

        recipe = Recipes.getRecipe();

        gif = recipe.data.url;

        fileExt = gif.split('.').pop();
        console.log("gif is:", gif);
        title = recipe.data.title;
        console.log("title is:", title);
        permalink = "https://www.reddit.com" + recipe.data.permalink;
        permalink = permalink.substr(0, permalink.lastIndexOf("?"));
        if (permalink.length == 0) {
            permalink = "https://www.reddit.com" + recipe.data.permalink;
        }
        
    }
    while ((fileExt.length > 5) && !(gif.match(/gfycat.com/)) && (Recipes.getLength() != 0));



    // mutate string if it's from gfycat
    if (gif.match(/gfycat.com/)) {
        gifQuery = gif.split('/');
        gifQuery = gifQuery[gifQuery.length - 1];
        gif = "http://giant.gfycat.com/" + gifQuery + ".mp4";
    }

    if (gif.match(/\.(gifv)$/) != null) {
        gif = gif.substr(0, gif.lastIndexOf(".")) + ".mp4";
    }

    if (gif.match(/\.(gif)$/) != null) {
        sendTypingOn(sender);
        sendGifMessage(sender, gif);
        // turn off search query
        //search = false;
        setTimeout(function() {
            sendTextMessage(sender, title);
        }, 500);


        sendTypingOn(sender);
        setTimeout(function() {
            //sendTextMessage(sender, permalink);
            sendQuickReply(recipientId, permalink, ['Another One', 'New Search']);
        }, 1000);
        return;
    }


    sendTypingOn(sender);
    sendVideoMessage(sender, gif);

    // turn off search query
    //search = false;
    setTimeout(function() {
        sendTextMessage(sender, title);
    }, 500);


    sendTypingOn(sender);
    setTimeout(function() {
        sendTextMessage(sender, permalink);
    }, 1000);
    return;
}

/*
 * Send another recipe based on last query
 *
 */
var sendAnotherOne = function(senderID, searchText) {
    if (Recipes.getLength() == 0) {
        return sendTextMessage(senderID, "I am out of recipe to show you :( Try another search query? 🙃");
    }

    search.lockSearch();
    sendTextMessage(senderID, 'One moment while I look for another ' + searchText + ' recipe.');

    return sendRecipe(senderID, searchText);
}

/*
 * Send a Gif using the Send API.
 *
 */
var sendGifMessage = function(recipientId, url) {
    type = "gif";
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: url
                }
            }
        }
    };

    callSendAPI(messageData);
}


/*
 * Send a video using the Send API.
 *
 */
var sendVideoMessage = function(recipientId, url) {
    type = "video";

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "video",
                payload: {
                    url: url
                }
            }
        }
    };

    callSendAPI(messageData);
}


/*
 * Send Help msg
 *
 */
var sendHelpMessage = function(recipientId) {
    sendTextMessage(recipientId, "To search for a gif recipe simply text me the ingredient or a plate's name and I will send back a gif recipe if I can find one 😌\n\nIf you are unsatisfied with the result, you can simply type 'Another One' to get another recipe result from the same search query 😚\n\nThere is a menu that is available at all times 😊!\n🍳 'Send a Message' allows you to text me the search query.\n🍣 'Random recipe' will send back a random recipe of the day.\n🌶 'Help' will let me send this message again.")
}

/*
 * Send Get Started message
 *
 */
var sendGetStartedMessage = function(recipientId) {
    sendQuickReply(recipientId, "Hello! I'm Chop Chop bot ^_^ You can use me to search for gif recipes, by telling me an ingredient or the name of the dish you are looking for and I will send you a random gif of it 🍱 \n\n🍳 Type 'Search' if you want to do this by searching for specific search query.\n🍟 Type 'Another' to get another recipe result from the last search query.\n🍜 Type 'Random' if you would like a random recipe of the day.\n🍕 Type 'Help' if you need help! \n\nLet me start you off with a random recipe!", ['Random Recipe']);
}

/*
 * Send a text message using the Send API.
 *
 */
var sendTextMessage = function(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
var sendQuickReply = function(recipientId, msg, quickreplies) {
    var quick_replies_arr = [];

    quickreplies.forEach(qr => {
        quick_replies_arr.push({
            content_type: "text",
            title: qr,
            payload: qr //Not necessary used but mandatory
        });
    });

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: msg,
            quick_replies: quick_replies_arr
        }
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
var sendTypingOn = function(recipientId) {
    console.log("Turning typing indicator on");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
var sendTypingOff = function(recipientId) {
    console.log("Turning typing indicator off");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    callSendAPI(messageData);
}


/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
var callSendAPI = function(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: config.PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }

        if (messageData.message != undefined && messageData.message.attachment != undefined) {
            search.lockSearch();
            if (type == "video" || type == "gif") {
                sendQuickReply(recipientId, "You can look at another video or type in a new search 🙂", ['Another One', 'New Search']);
                return sendTypingOff(recipientId);
            }
        }

    });
}


module.exports = {
    sendRecipe: sendRecipe,
    sendAnotherOne: sendAnotherOne,
    sendGifMessage: sendGifMessage,
    sendVideoMessage: sendVideoMessage,
    sendHelpMessage: sendHelpMessage,
    sendGetStartedMessage: sendGetStartedMessage,
    sendTextMessage: sendTextMessage,
    sendQuickReply: sendQuickReply,
    sendTypingOn: sendTypingOn,
    sendTypingOff: sendTypingOff,
    callSendAPI: callSendAPI,
}
