'use strict'

/* Search.js Interface
 * Contains all the functions for the search flag.
 * isSearchLocked() checks if the search boolean is on or off
 * unlockSearch() mutates search to be false
 * lockSearch() mutates search to be true
 */

/* search is a flag to indicate user's message as search query
 * search = true means whatever user is typing to bot is a search query
 * search = false means otherwise -- we need to then check what the user is typing
 */

search = true; // by default search is on

/* isSearchLocked() checks if the search boolean is on or off
 * isSearchLocked: NaN -> Bool
 */
var isSearchLocked = function() {
	return search;
}

/* unlockSearch() mutates the search string to be off/false
 */
var unlockSearch = function() {
	search = false;
}

/* lockSearch() mutates the search string to be on/true
 */
var lockSearch = function () {
	search = true;
}

// export these functions
module.exports = {
    isSearchLocked: isSearchLocked,
    unlockSearch: unlockSearch,
    lockSearch: lockSearch
}