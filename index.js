'use strict';

/* 
 * Import node modules required for app
 */
const
    bodyParser = require('body-parser'),
    express = require('express'),
    https = require('https'),
    request = require('request'),
    log = null,
    Wit = require('node-wit').Wit,
    Snoocore = require("snoocore");

/* 
 * Import page modules
 */
const
    config = require('./config'),
    FB = require('./methods/FB'),
    Recipes = require('./methods/Recipes'),
    Search = require('./methods/Search'),
    Session = require('./methods/Session'),
    sendAPI = require('./services/sendAPI');

var searchText = "";

/* 
 * Configurations
 */

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ? (process.env.MESSENGER_VALIDATION_TOKEN) : config.MESSENGER_VALIDATION_TOKEN;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN) : config.PAGE_ACCESS_TOKEN;

// Reddit configuration
const
    REDDIT_USER = (process.env.REDDIT_USER) ? (process.env.REDDIT_USER) : config.REDDIT_CONFIG.REDDIT_USER,
    REDDIT_KEY = (process.env.REDDIT_KEY) ? (process.env.REDDIT_KEY) : config.REDDIT_CONFIG.REDDIT_KEY,
    REDDIT_SECRET = (process.env.REDDIT_SECRET) ? (process.env.REDDIT_SECRET) : config.REDDIT_CONFIG.REDDIT_SECRET,
    REDDIT_PW = (process.env.REDDIT_PW) ? (process.env.REDDIT_PW) : config.REDDIT_CONFIG.REDDIT_PW;

/*
 * Setting up Reddit configurations
 */
const reddit = new Snoocore({
    userAgent: REDDIT_USER,
    oauth: {
        type: 'script',
        key: REDDIT_KEY,
        secret: REDDIT_SECRET,
        username: REDDIT_USER,
        password: REDDIT_PW,
        // make sure to set all the scopes you need.
        scope: ['flair', 'identity', 'read']
    }
});

/*
 * ----------------------------------------------------------------------------
 * Main app's code
 * ----------------------------------------------------------------------------
 */

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));

// Start with customizing the bot to have a Get Started msg + Persistent menu
FB.getStarted();
FB.addPersistentMenu();

/*
 * ----------------------------------------------------------------------------
 * Modified FB Specific Code
 * Forked from https://github.com/fbsamples/messenger-platform-samples
 * ----------------------------------------------------------------------------
 */

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

/*
 * All backs for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    receivedMessageRead(messagingEvent);
                } else {
                    console.log('received event', JSON.stringify(messagingEvent));
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've 
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
});

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback 
    // button for Structured Messages. 
    var payload = event.postback.payload;

    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to 
    // let them know it was successful
    // sendTextMessage(senderID, "Postback called - " + payload);

    switch (payload) {
        case 'GET_STARTED':
            Search.unlockSearch();
            sendAPI.sendGetStartedMessage(senderID);
            break;
        case 'MENU_ANOTHER':
            Search.lockSearch();
            return sendAPI.sendAnotherOne(senderID, searchText);
            break;
        case 'MENU_SEARCH':
            Search.lockSearch();
            sendAPI.sendTextMessage(senderID, "Search query is on! Tell me what you would like to search for. You may search for recipes such as \'cupcake\', \'fried rice,\' or \'Korean.\'\n✍️ 🌚 🌝");
            break;
        case 'MENU_RANDOM':
            Search.unlockSearch();
            grabRecipe(senderID, "random", true);
            break;
        case 'MENU_HELP':
            Search.unlockSearch();
            sendAPI.sendHelpMessage(senderID);
            break;
        default:
            break;
    }
}


/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;



    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
        // Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s",
            messageId, appId, metadata);
        return;
    } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log("Quick reply for message %s with payload %s",
            messageId, quickReplyPayload);

        //sendTextMessage(senderID, "Quick reply tapped - " + quickReplyPayload);
        console.log("Quick reply tapped - " + quickReplyPayload);
        switch (quickReplyPayload) {
            case 'Help':
                sendAPI.sendHelpMessage(senderID);
                break;
            case 'Random Recipe':
                grabRecipe(senderID, messageText, true);
                break;
            case 'Random':
                grabRecipe(senderID, messageText, true);
                break;
            case 'Search':
                Search.lockSearch();
                return sendTextMessage(senderID, "Search query is on! Tell me what you would like to search for. You may search for recipes such as \'cupcake\', \'fried rice,\' or \'Korean.\'\n✍️ 🌚 🌝");
                break;
            case 'New Search':
                Search.lockSearch;
                return sendAPI.sendTextMessage(senderID, "Search query is on! Tell me what you would like to search for. You may search for recipes such as \'cupcake\', \'fried rice,\' or \'Korean.\'\n✍️ 🌚 🌝");
                break;
            case 'Another One':
                return sendAPI.sendAnotherOne(senderID, searchText);
                break;
            default:
                break;
        }
        return;
    }

    if (messageText) {

        var lowercaseText = messageText.toLowerCase();

        if (lowercaseText.includes("random")) {
            return grabRecipe(senderID, messageText, true);
        } else if (lowercaseText.includes("help")) {
            return sendAPI.sendHelpMessage(senderID);
        }

        // if (search == true) {
        //     if (lowercaseText === "random" || lowercaseText === 'random recipe') {
        //         return grabRecipe(senderID, messageText, true);
        //     } else {
        //         return grabRecipe(senderID, messageText, false);
        //     }
        // }

        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example. Otherwise, just echo
        // the text we received.
        else if (lowercaseText.includes('another')) {
            return sendAPI.sendAnotherOne(senderID, searchText);
        } else if (lowercaseText.includes('search')) {
            Search.lockSearch();
            return sendAPI.sendTextMessage(senderID, "Search query is on! Tell me what you would like to search for. You may search for recipes such as \'cupcake\', \'fried rice,\' or \'Korean.\'\n✍️ 🌚 🌝");
        } else if (lowercaseText.includes('no') || lowercaseText.includes('nah')) {
            return sendTextMessage(senderID, "Oh, Okay.");
        } else if (lowercaseText.includes('yes') || lowercaseText.includes('yeah')) {
            return sendTextMessage(senderID, "Yeah.");
        } else {
            // Wit runActions here
            return grabRecipe(senderID, messageText, false);
        }

    } else if (messageAttachments) {
        sendAPI.sendTextMessage(senderID, "Message with attachment received");
    }
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    console.log("Received message read event for watermark %d and sequence " +
        "number %d", watermark, sequenceNumber);
}


/*
 * grabRecipe
 *
 * Looks up the recipe on Reddit's /r/GifRecipes
 * 
 */
function grabRecipe(sender, text, random) {

    // If user is requesting a specific recipe
    if (!random) {

        var query = (text.toLowerCase()).replace(/ /g, "+");
        // the msg needs to be searched in reddit

        sendAPI.sendTextMessage(sender, 'One moment please! Searching for... ' + text + ".\n\nThere may be a delay in sending the gif.");
        searchText = text;

        // Get 20 posts from /r/GifRecipes
        var promise = reddit('/r/GifRecipes/search').get({
            q: query,
            restrict_sr: "on",
            sort: "relevance",
            limit: 20
        });

        sendAPI.sendTypingOn(sender);
        return promise.then((response) => {
            sendAPI.sendTypingOn(sender);
            if (response.data.children.length == 0) {
                Search.lockSearch();
                return sendAPI.sendTextMessage(sender, "Sorry, I couldn't find anything on " + text + " :( You can try typing another query and I will search it up for you 🤔");
            }
            // else

            var recipes = Recipes.setRecipes(response.data.children, sender);
            return sendAPI.sendRecipe(sender, searchText);
        });
    }

    // Random recipe
    else {
        sendAPI.sendTextMessage(sender, 'Give me a moment while I look for a random recipe 🙃 \n\nThere may be a delay in sending the gif.');
        searchText = "random";

        // Get 20 posts from /r/GifRecipes
        var promise = reddit('/r/GifRecipes/top').get();

        sendAPI.sendTypingOn(sender);
        return promise.then((response) => {
            sendAPI.sendTypingOn(sender);
            if (response.data.children.length == 0) {
                Search.lockSearch();
                return sendAPI.sendTextMessage(sender, "Sorry, I couldn't find anything on " + text + " :( You can try typing another query and I will search it up for you 🤔");
            }
            // else
            var recipes = Recipes.setRecipes(response.data.children, sender);
            return sendAPI.sendRecipe(sender, searchText);
        });
    }
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
