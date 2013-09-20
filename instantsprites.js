// Instant Compass Sprites v1.4 - By Stereokai
// =========================================
// See README for help
// 
// This script will result in a SCSS mixin, similar to the following and according to your settings and sprites
// $folder-sprites: sprite-map("folder/*.png", $position: 50%, $spacing: 20px);
// @mixin button-sprites-mixin (
// 	$sprite-name,
// 	[sprite states according to what's in the folder, for example:],
// 	$normal: false,
// 	$hover: false,
// 	$down: false,
// 	$overwriteX: false,
// 	$overwriteY: false,
// 	$diffX: false,
// 	$diffY: false) {
// 	$pos: "";
// 
// 	[sprite states according to what's in the folder, for example:],
// 	@if ($normal or $hover or $down) {
// 		@if $normal {
// 			$pos: sprite-position($folder-sprites, $sprite-name + "-normal", 50%, 5%);
// 		}
// 		@if $hover {
// 			$pos: sprite-position($folder-sprites, $sprite-name + "-hover", 50%, 5%);
// 		}
// 		@if $down {
// 			$pos: sprite-position($folder-sprites, $sprite-name + "-down", 50%, 5%);
// 		}
// 	}
// 	@else {
// 		$pos: sprite-position($folder-sprites, $sprite-name, 50%, 5%);
// 	}
// 
// 	$x: if($diffX, nth($pos, 1) + $diffX, nth($pos, 1));
// 	$y: if($diffY, nth($pos, 2) + $diffY, nth($pos, 2));
// 
// 	$x: if($overwriteX, $overwriteX, $x);
// 	$y: if($overwriteY, $overwriteY, $y);
// 
// 	background-position: $x $y;
// }

/*
 * Settings
 */

// Add or remove states as you wish, @state is default, and will not appear in CSS class names
// Default is optional, and you may have more than one.
var states = ['@normal', 'hover', 'down'],

/*
 * Instant Sprites
 */

	fs = require('fs'),
	readline = require('readline'),
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	slash = !process.argv[2].indexOf('/') ? '/' : '\\', // windows/unix?
	path = process.argv[2].split(slash),
	folder = path.pop() || path.pop(), // take care of a trailing slash

	spritesFile = process.argv[2] + slash + 'sprites.json',
	userOverwrites = {},
	makeNewSpritesFile = 0,

	mapName = '$' + folder + '-sprites',
	mixinName = folder + '-sprites-mixin',

	currentSprite = [],
	SCSS = '',

	endsWith = function (str, suffix) {
				// also make sure we don't match against an empty string
	    return 	suffix.length === 0 ? false : (str.indexOf(suffix, str.length - suffix.length) !== -1);
	},

	filelist = fs.readdirSync(process.argv[2]).filter(function (file) { return endsWith(file, 'png'); }),

	getPositionsFromFile = function () {
		fs.readFile(spritesFile, 'utf8', function (err, data) {
			if (err) {
				// makeNewSpritesFile = 0;
			} else {
				try {
					userOverwrites = JSON.parse(data);
					makeNewSpritesFile = 3; // JSON is intact
				} catch (e) {
					makeNewSpritesFile = 2; // probem with JSON file
				}
			}
			
			if (makeNewSpritesFile < 3) {
				rl.question(
					'\nProcessing sprites... Would you like to save sprite data in a separate json file? (y/n) ',
					function(answer) {
			 			if (answer.match(/^y(es)?$/i)) {
			 				makeNewSpritesFile = makeNewSpritesFile || 1;
			 			} else {
			 				makeNewSpritesFile = 0;
			 			}

			 			instantSprites();
				});
			} else {
				console.log('\nProcessing sprites...');
				makeNewSpritesFile = 1;
				instantSprites();
			}
		});
	},

	instantSprites = function () {
		makeMixin();
		processSprites();
		jsonFile();
	},

	makeMixin = function () {
		// Define sprite map with Compass
		SCSS += mapName + ': sprite-map("' + folder + '/*.png", $position: 50%, $spacing: 20px);\n';

		// Make the mixin for this sprite map
		SCSS += '@mixin ' + mixinName + ' (\n	$sprite-name,\n';
		// Make this line: 	@if ($normal or $hover or $down or $on) {
		var mixinswrap = (function () {
			var mixinswrap = '	@if ($' + getState(0) + ' or $';
			for (i = 1; i < states.length - 1; i++) {
				mixinswrap += getState(i) + ' or $';
			}
			return mixinswrap + getState(i) + ') {\n';
		})();

		for (i = 0, params = mixins = ''; i < states.length; i++) {
			params += (getState(i) !== '' ? '	$' + getState(i) + ': false,\n' : '');
			mixins += makeStateIf(getState(i));
			if (i === states.length - 1) { SCSS += params + '	$overwriteX: false,\n	$overwriteY: false,\n	$diffX: false,\n	$diffY: false' + ') {\n	$pos: "";\n\n' + mixinswrap + mixins; }
		}
		SCSS +=	'	}\n	@else {\n' +
				'		$pos: sprite-position(' + mapName + ', $sprite-name, 50%, 5%);\n	}\n\n' +
				'	$x: if($diffX, nth($pos, 1) + $diffX, nth($pos, 1));\n' +
				'	$y: if($diffY, nth($pos, 2) + $diffY, nth($pos, 2));\n\n' +
				'	$x: if($overwriteX, $overwriteX, $x);\n' +
				'	$y: if($overwriteY, $overwriteY, $y);\n\n' +
				'	background-position: $x $y;\n' +
				'}\n\n';
	},

	makeCSSClass = function (spriteName, stateIndex) {
		var state = (typeof stateIndex === 'undefined' ? '' : states[stateIndex]),
			statesString;
			statesString = (!state ? '' : ', $' + getState(stateIndex) + ': true');
			state = (state && state.indexOf('@') === -1 ? '.' + getState(stateIndex) : '');

		 	return '.' + spriteName + state +
				' {\n	@include ' + mixinName + '(' + 
					spriteName + statesString + checkOverwrites(spriteName, stateIndex) +
				');\n}\n';
	},

	makeOverwrite = function (overwrite, value) {
		return '$' + overwrite + ': ' + value;
	},

	makeStateIf = function (state) {
		return	'		@if $' + state + ' {\n' +
				'			$pos: sprite-position(' + mapName + ', $sprite-name + "-' + state + '", 50%, 5%);\n		}\n';
	},

	getState = function (index) {
		return states[index].replace('\@', '');
	},

	processSprites = function () {
		// Make classes for each sprite and its states
		while (filelist.length > -1) {
			if (filelist.length === 0 && currentSprite.length > 0) {
				// this is the last sprite in the file list
				findSpriteStates();
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
					findSpriteStates();
					currentSprite.push(fileNoExt);
				}
			}

		}
	},

	findSpriteStates = function () {
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
					if (endsWith(state, getState(i))) {
						spriteStates[states[i]] = true;
						match = true;
						matches++;

						// store sprite name
						matchedSpriteName = state.substr(0, state.length - getState(i).length - 1);
						break; 
					}
				}

				// if no match, this is not a state we recognize,
				// so this should become a sprite on its own.
				// (state variable contains the sprite name)
				if (!match) {
					SCSS += makeCSSClass(state);
					if (makeNewSpritesFile) { userOverwrites[state] = userOverwrites[state] || {};	}
				}

			// from this point on these are all sprites with no recognized states
			// (state variable contains the sprite name)
			} else {
				SCSS += makeCSSClass(state);
				if (makeNewSpritesFile) { userOverwrites[state] = userOverwrites[state] || {};	}
			}
		}

		if (matches > 0) {
			if (makeNewSpritesFile) { userOverwrites[matchedSpriteName] = userOverwrites[matchedSpriteName] || {};	}

			for (i = 0; i < states.length; i++) {
				if (spriteStates[states[i]]) {
					// build parameters for states
					SCSS += makeCSSClass(matchedSpriteName, i);
					if (makeNewSpritesFile) {
						userOverwrites[matchedSpriteName][getState(i)] = userOverwrites[matchedSpriteName][getState(i)] || {};
					}
				}
			}
		}

		// reset stack
		currentSprite = [];
	},

	checkOverwrites = function (spriteName, stateIndex) {
		var overwrites,
			ow = [],
			str;

		if (userOverwrites[spriteName]) {
			if (stateIndex) {
				if (userOverwrites[spriteName][getState(stateIndex)]) {
					overwrites = userOverwrites[spriteName][getState(stateIndex)];
				} else { return ''; }
			} else {
				overwrites = userOverwrites[spriteName];
			}
		} else { return ''; }

		for (overwrite in overwrites) {
			switch (overwrite) {
				case 'diffY':
				case 'diffX':
				case 'overwriteY':
				case 'overwriteX':
					ow.push(makeOverwrite(overwrite, overwrites[overwrite]));
			}
		}

		str = ow.join(', ');
		return str.length ? ', ' + str : '';
	},

	jsonFile = function () {
		if (makeNewSpritesFile === 2) {
			rl.question(
				'\nsprites.json already exists in this directory, but seems to be damaged.' +
				'\nWould you like to create a new file? (y/n)' +
				'\nWARNING: This will overwrite any user data!\n\n',
				function(answer) {
		 			if (answer.match(/^y(es)?$/i)) {
		 				writeFiles(true);
		 			}
				}
			);			
		} else if (makeNewSpritesFile === 1) {
			writeFiles(true);
		} else {
			writeFiles();
		}
	},

	writeFiles = function (json) {
		console.log('\nWriting to disk...');

		if (json) { fs.writeFileSync(spritesFile, JSON.stringify(userOverwrites, null, 4)); }
		fs.writeFileSync(process.argv[2] + slash + '_' + folder + '-sprites.scss', SCSS);
		
		console.log('\nProcess complete. Please copy _' + folder + '-sprites.scss' + ' to your SCSS directory.');
		process.exit(0);
	};

getPositionsFromFile();