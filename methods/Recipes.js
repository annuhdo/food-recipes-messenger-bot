'use strict'

const Session = require('./Session');

/* Recipes.js Interface
 * Contains all the functions for the search flag.
 * setRecipes(Array) mutates the gifsArr to be of the Array parameter
 * getRecipe() gets a random recipe object from gifsArr and returns that
 * getLength() returns the length of gifsArr
 */

/* gifsArr contains an array of 20 recipes grabbed from Reddit based on a
 * search query or random top results
 * gifsArr is initially empty
 */

/* setRecipes(Array) mutates the gifsArr to be of the Array parameter and
 * returns that
 * setRecipes: Array of [Object] -> Array of Objects
 */
var setRecipes = function(arr, sender) {
	// We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    var session = Session.retrieveSession(sender);

    Session.setContext("gifsArr", session, arr);
    return;
}

/* getRecipe() gets a random recipe object from gifsArr and returns that
 * getRecipe: NaN -> [Object]
 */
var getRecipe = function(sender) {
	// We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    var session = Session.retrieveSession(sender);

    if (!exist(sender)) {
    	return;
    }

	var gifsArr = session.context.gifsArr;
	if (gifsArr.length === 0) {
		return;
	}
	// a random number from list of results
	var rnd = Math.floor(Math.random() * gifsArr.length);
	var recipe = gifsArr[rnd];
	gifsArr.splice(rnd, 1);
	if (gifsArr.length == 0) {
		delete session.context["gifsArr"];
	}
	setRecipes(gifsArr, sender); // set new array of gifs back
	return recipe;
}

/* exist() checks if gifsArr exists in current user's session
 * getLength: NaN -> Int
 */
var exist = function(sender) {
	// We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    var session = Session.retrieveSession(sender);

    return ("gifsArr" in session.context);
}

// export the functions
module.exports = {
    setRecipes: setRecipes,
    getRecipe: getRecipe,
    exist: exist
}