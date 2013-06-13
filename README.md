Instant Sprites for Compass - By Stereokai
===========================================

### What is this?

This Node.js script generates a .scss file compatible and ready to compile with Compass,
along with respective CSS classes to allow for easy management of CSS sprites.

### What does it do?

It reads all files in a directory, assuming they are all sprites with state suffixes, such as -normal, -hover and -down.

It then generates the Compass code for magically generating a sprite image and a matching Compass sprite map, as well as SCSS classes that can help you overwrite background-position for each sprite-class and even each state.

### How to use it?

`> node instantsprites.js <path/to/sprite/folder>` from your console to generate the .scss file.
And then `@import` it in your main scss file. Finally you have to include the sprite map in an element or class:

	background-image: $<mapName>-sprites; // <mapName> is the name of the folder containing the sprites

You're done!

### How does it work?

It is important to note, that this script assumes the folder it is given, is already configured as the images_dir
in the Compass project config.rb. It also assumes that all files in this folder are png sprites.

It then runs through all of the files looking for names which end with one of the states found in the `states` array.

It will generate the code for Compass generates to generate a `$sprite-map` and a sprite asset, so you don't need to worry about that.

### So how does it look like?

The script automatically generates this mixin for you:

	@mixin <mapName>-sprites-mixin($sprite-name, $normal: false [, more states], $overwriteX: false, $overwriteY: false)

And it automatically generates CSS classes for each sprite type, for example:

	.sprite-with-states.normal {
		@include <mapName>-sprites-mixin(sprite-with-states, $normal: true);
	}
	.sprite-with-states.hover {
		@include <mapName>-sprites-mixin(sprite-with-states, $hover: true);
	}
	.sprite-with-states.down {
		@include <mapName>-sprites-mixin(sprite-with-states, $down: true);
	}
	.single-sprite {
		@include <mapName>-sprites-mixin(single-sprite);
	}

### And what about overwriting `background-position`?

Oh yes, that too. Once your code is generated, You can then manually edit the resulted SCSS to overwrite with your own position values:

	.sprite-with-states.down {
		@include <mapName>-sprites-mixin(sprite-with-states, $down: true, $overwriteX: 6px, $overwriteY: 20px);
	}

### One last thing, what about single sprites with no states?

We've got you covered! If your sprite file name doesn't end with a recognized state, you'll get this CSS:

	.single-sprite {
		@include <mapName>-sprites-mixin(single-sprite);
	}