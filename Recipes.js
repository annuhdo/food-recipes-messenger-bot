'use strict'

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

var gifsArr = "";

/* setRecipes(Array) mutates the gifsArr to be of the Array parameter and
 * returns that
 * setRecipes: Array of [Object] -> Array of Objects
 */
var setRecipes = function(arr) {
	gifsArr = arr;
	return gifsArr;
}

/* getRecipe() gets a random recipe object from gifsArr and returns that
 * getRecipe: NaN -> [Object]
 */
var getRecipe = function() {
	if (gifsArr.length === 0) {
		return;
	}
	// a random number from list of results
	var rnd = Math.floor(Math.random() * gifsArr.length);
	var recipe = gifsArr[rnd];
	gifsArr.splice(rnd, 1);
	return recipe;
}

/* getLength() returns the length of gifsArr
 * getLength: NaN -> Int
 */
var getLength = function() {
	return gifsArr.length;
}

// export the functions
module.exports = {
    setRecipes: setRecipes,
    getRecipe: getRecipe,
    getLength: getLength
}