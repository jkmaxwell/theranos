/*

- put five minute timeout on door close at end of thing with the door hanging open
- return reader to the screen
- make input fields store and retrieve data

*/

var DEBUG=true;								// TOGGLE FIREBUG DEBUGGING -- set in TheranOS prefs

var TheranOS = { };									// Set up TheranOS Namespace
	TheranOS.Strings = { };							// Set up Strings for localization
	TheranOS.currentPage = null;

	TheranOS.Config = {}
	TheranOS.Config.Modes = {}

function clone(object) { 					// from Pro Javascript Design Patterns: Clone function for Prototypal inheiritance
	function F() {}
	F.prototype = object;
	return new F();
} 

TheranOS.Init = function() {
	TheranOS.UI.IntroRefresh = (DEBUG == true) ? 1000 : 7000  												// UI: Set intro refresh time to 1000 so we don't have to wait
	$.getScript("language/en_US/LocalizedStrings.js", function(){ TheranOS.Strings = localizedStrings; });	// Localization: Load Strings
	
	TheranOS.UI.PageManager.drawPage('screen:first', "default", function(){									// UI: Load intro screen...
		setTimeout(function() {																				// ...and refresh to start screen
			TheranOS.UI.PageManager.drawPage('screen:eq(1)', "whiteout")
        }, TheranOS.UI.IntroRefresh);
	})
}