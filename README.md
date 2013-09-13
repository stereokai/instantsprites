Instant Sprites for Compass
===========================

### What is this?

This Node.js script generates a .scss file compatible and ready to compile with Compass,
along with respective CSS classes to allow for easy management of CSS sprites.

### What does it do?

It reads all files in a directory, assuming they are all sprites with state suffixes, such as -normal, -hover and -down.

It then generates the Compass code for magically generating a sprite image and a matching Compass sprite map, as well as SCSS classes that can help you correct background-position for each sprite-class and even each sprite state.

### How to use it?

`> node instantsprites.js <path/to/sprite/folder>` from your console to generate the .scss file.
And then `@import` it in your main scss file. Finally you have to include the sprite map in an element or class:

	background-image: $<mapName>-sprites; // <mapName> is the name of the folder containing the sprites

You're done!

### How does it work?

It is important to note, that this script assumes the folder it is given, is located inside `images_dir`, as configured in the project's Compass config.rb. It also assumes that all files in this folder are **png** images.

It then runs through all files looking for names which end with one of the states found in the `states` array, which means your folder should look like this:
```
├── Sprite folder
|	├── button-name-normal.png
|	├── button-name-hover.png
|	└── button-name-down.png
```

It will generate the code for Compass needs to generate a `$sprite-map` and a sprite asset for you, so you don't need to wrap your head around that. The sprite map will take the name of the folder containing your sprites.

### So how does it look like?

The script automatically generates this mixin for you:

	@mixin <mapName>-sprites-mixin($sprite-name, $normal: false [, more states], $overwriteX: false, $overwriteY: false)

And it automatically generates CSS classes for each sprite type, for example:

	.button-name.normal {
		@include <mapName>-sprites-mixin(button-name, $normal: true);
	}
	.button-name.hover {
		@include <mapName>-sprites-mixin(button-name, $hover: true);
	}
	.button-name.down {
		@include <mapName>-sprites-mixin(button-name, $down: true);
	}

### And what about correcting/overwriting `background-position`?

Hell yes! Compass generate position values which are sometimes a bit off. Once your code is generated, You can then manually edit the resulted SCSS to overwrite with your own position values. Using the `diffX` and `diffY` parameters you can correct the CSS relative to Compass's original positions:

	.button-name.down {
		@include <mapName>-sprites-mixin(button-name, $down: true, $diffX: 6px, $diffY: 20px);
	}

You can even completely overwrite `background-position`:

	.button-name.down {
		@include <mapName>-sprites-mixin(button-name, $down: true, $overwriteX: 50%, $overwriteY: 430px);
	}

### One last thing, what about sprites with no states?

We've got you covered! If your sprite file name doesn't end with a recognized state, you'll get this CSS:

	.static-sprite {
		@include <mapName>-sprites-mixin(single-sprite);
	}
