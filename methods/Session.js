'use strict'

var sessions = {};

var findOrCreateSession = function(fbid){
    var sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
      if (sessions[k].fbid === fbid) {
         // Yep, got it!
         sessionId = k;
      }
    });
    if (!sessionId) {
      // No session found for user fbid, let's create a new one
      sessionId = new Date().toISOString();
      sessions[sessionId] = {fbid: fbid, context: {}};
    }
    return sessionId;
}

var retrieveSession = function(senderID) {
   // We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    const sessionId = findOrCreateSession(senderID);
    var session = sessions[sessionId];
    return session;
}

var setContext = function(contextType, session, param) {
  session.context[contextType] = param;
}

module.exports = {
    findOrCreateSession: findOrCreateSession,
    retrieveSession: retrieveSession,
    setContext: setContext
}