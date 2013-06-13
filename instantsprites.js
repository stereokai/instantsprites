// Instant Compass Sprites v1 - By Stereokai
// ===========================================
// See README for help

	// add or remove states as you wish
var states = ['normal', 'hover', 'down'],

	fs = require('fs'),
	filelist = fs.readdirSync(process.argv[2]),
	slash = !process.argv[2].indexOf('/') ? '/' : '\\', // windows/unix?
	path = process.argv[2].split(slash),
	folder = path.pop() || path.pop(), // take care of a trailing slash
	mapName = '$' + folder + '-sprites';
	mixinName = folder + '-sprites-mixin';
	currentSprite = [],
	SCSS = '',
	endsWith = function (str, suffix) {
				// make sure we don't match against an empty string
	    return 	suffix.length === 0 ? false : (str.indexOf(suffix, str.length - suffix.length) !== -1);
	},
	makeCSSClass = function (spriteName, statesString, state) {
		statesString = (statesString ? ', ' + statesString : '');
		return 	'.' + spriteName +
				(state ? '.' + state : '') +
				' {\n	@include ' + mixinName + '(' + spriteName + statesString + ');\n}\n';
	},
	makeStateIf = function (state) {
		return	'		@if $' + state + ' {\n' +
				'			$pos: sprite-position(' + mapName + ', $sprite-name + "-' + state + '", 50%, 5%);\n		}\n';
	},
	processSprite = function () {
		var spriteStates = {},
			matchedSpriteName = '',
			matches = 0;
		// initiate flags for all states
		for (i = 0; i < states.length; i++) {
			spriteStates[states[i]] = false;	
		}

		while (currentSprite.length > 0) {
			var state = currentSprite.shift(),
				match = false;
			// if we covered all states for this class let's skip this part
			if (matches < states.length) {
				for (i = 0; i < states.length; i++) {
					if (endsWith(state, states[i])) {
						spriteStates[states[i]] = true;
						match = true;
						matches++;

						// store sprite name
						matchedSpriteName = state.substr(0, state.length - states[i].length - 1);
						break; 
					}
				}
				// if no match, this is not a state we recognize,
				// so this is in fact a sprite on its own, only with a similar name
				if (!match) {
					SCSS += makeCSSClass(state);
				}
			// from this point on these are all sprites with no recognized states
			} else {
				SCSS += makeCSSClass(state);
			}
		}

		if (matches > 0) {
			for (i = 0; i < states.length; i++) {
				if (spriteStates[states[i]]) {
					// build parameters for states
					SCSS += makeCSSClass(matchedSpriteName, '$' + states[i] + ': true', states[i]);
				}
			}
		}

		// reset stack
		currentSprite = [];
	};

// Define sprite map with Compass
SCSS += mapName + ': sprite-map("' + folder + '/*.png", $position: 50%, $spacing: 20px);\n';

// Make the mixin for this sprite map
SCSS += '@mixin ' + mixinName + ' (\n	$sprite-name,\n';
var mixinswrap = '	@if ($' + states.join(' or $') + ') {\n';
for (i = 0, params = mixins = ''; i < states.length; i++) {
	params += (states[i] !== '' ? '	$' + states[i] + ': false,\n' : '');
	mixins += makeStateIf(states[i]);
	if (i == states.length - 1) { SCSS += params + '	$overwriteX: false,\n	$overwriteY: false' + ') {\n	$pos: "";\n\n' + mixinswrap + mixins; }
}
SCSS +=	'	}\n	@else {\n' +
		'		$pos: sprite-position(' + mapName + ', $sprite-name, 50%, 5%);\n	}\n\n' +
		'	$x: if($overwriteX, $overwriteX, nth($pos, 1));\n' +
		'	$y: if($overwriteY, $overwriteY, nth($pos, 2));\n' +
		'	background-position: $x $y;\n' +
		'}\n\n';

// Now let's make classes for each sprite and its states
while (filelist.length > -1) {
	if (filelist.length === 0 && currentSprite.length > 0) {
		// this is the last sprite
		processSprite();
		break;
	}

	var fileNoExt = filelist.shift();
		fileNoExt = fileNoExt.substr(0, fileNoExt.lastIndexOf('.'));

	if (currentSprite.length == 0) {
		// starting a new sprite
		currentSprite.push(fileNoExt);
	} else {
		// check if we're still on the same sprite (check for identical file names, bar the state suffix)
		var spr1 = fileNoExt.substring(0, fileNoExt.lastIndexOf('-')),
			spr2 = currentSprite[0].substring(0, currentSprite[0].lastIndexOf('-'));
		if (spr1.indexOf(spr2) === 0 || spr2.indexOf(spr1) === 0) {
			// adding new state to current sprite
			currentSprite.push(fileNoExt);
		} else {
			// we finished running over this sprite's different states
			// now let's process it and start traversing the next sprite
			processSprite();
			currentSprite.push(fileNoExt);
		}
	}

}

fs.writeFile(process.argv[2] + slash + '_' + folder + '-sprites.scss', SCSS);