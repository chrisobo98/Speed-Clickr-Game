// **text** is quotes from documentation
// ***** means important


// start score at zero
var Clicker = {
    score: 0
};

// setup clicker for use
Clicker.Preloader = function () {};

Clicker.Preloader.prototype = {

    // **The init method is the first thing to be called in your state. It’s called just once when the state starts. It’s called before preload, create or anything else, hence its name, a short-form of ‘initialization’. **
    init: function () {

        this.input.maxPointers = 1;

        // used to center game box *****
        this.scale.pageAlignHorizontally = true;

    },

    // main way Phaser loads assets into your game 
    preload: function () {

        // **Every time you call a Loader method, such as load.image, it adds the file you specify onto a queue that the Loader manages**
        this.load.path = 'assets/';
        this.load.image('logo');
        this.load.bitmapFont('fat-and-tiny');
        this.load.bitmapFont('digits');
        this.load.shader('ripples');
        this.load.spritesheet('sprite', 'sprite.png', 32, 32);

    },

    // called immediately after preload is complete
    create: function () {

        // start main menu
        this.state.start('Clicker.MainMenu');

    }

};

Clicker.MainMenu = function () {

    this.filter = null;

};


// main menu that is the first seen, code before this is behind the scenes preload/init stuff
Clicker.MainMenu.prototype = {

    create: function () {

        // background color
        this.stage.backgroundColor = 0x000000;

        //  ***** access the shader source from the cache and create your filter
        var uniforms = {
            color: {
                type: '3fv',
                value: [0.1, 0.3, 0.6]
            }
        };

        // **A Filter object expects three things: a reference to the current game instance, a uniforms object (which can be null) and the shader source. The source is in the cache, a result of having loaded the frag file, so we can pull it directly into the filter. **
        this.filter = new Phaser.Filter(this.game, uniforms, this.cache.getShader('ripples'));

        // adds ripples filter in 800x600 size
        this.filter.addToWorld(0, 0, 800, 600);

        // creates a logo at the main menu
        var logo = this.add.image(this.world.centerX, 48, 'logo');

        // center it to the middle 
        logo.anchor.x = 0.5;

        // adds the text click if you dare with fat and tiny png file / font sheet 
        var start = this.add.bitmapText(this.world.centerX, 460, 'fat-and-tiny', 'Click if you dare', 64);

        // center this too
        start.anchor.x = 0.5;

        // keepin it red
        start.tint = 0xff0000;

        // creating the high score area with the clicker score so it shows the high score! using and font png sheet 
        var score = this.add.bitmapText(this.world.centerX, 500, 'fat-and-tiny', 'HIGH SCORE: ' + Clicker.score, 64);

        // center again because for some reason its not already
        score.anchor.x = 0.5;

        // red yet again
        score.tint = 0xff0000;

        // make text clickable to start the game
        this.input.onDown.addOnce(this.start, this);

    },

    start: function () {

        // tell it what the clickableness will do - takes it to the game state
        this.state.start('Clicker.Game');

    },

    update: function () {

        this.filter.update();

    }

};

// *****When you don’t clear the Phaser World between state swaps there are interesting side-effects, some of which you may not expect at all.**
// in this case I did not expect any at all but its still a good practice
Clicker.Game = function () {

    this.score = 0;
    this.scoreText = null;
    this.timeText = null;
    this.target = null;
    this.stars = null;
    this.timer = null;
    this.tremorRect = null;
    this.colors = {
        r: 0.1,
        g: 0.1,
        b: 0.1
    };
    this.uniform = null;
    this.filter = null;
    this.pauseKey = null;
    this.debugKey = null;
    this.showDebug = false;

};


Clicker.Game.prototype = {

    // initializing next game state
    init: function () {

        this.score = 0;
        this.colors = {
            r: 0.1,
            g: 0.3,
            b: 0.6
        };

    },

    create: function () {

        // have to create the background and all that again because its a new state, going to add same comments for the code below as above because I love comments
        this.stage.backgroundColor = 0x000000;

        //  ***** access the shader source from the cache and create your filter
        var uniforms = {
            color: {
                type: '3fv',
                value: [0.0, 0.0, 0.0]
            }
        };

        // **A Filter object expects three things: a reference to the current game instance, a uniforms object (which can be null) and the shader source. The source is in the cache, a result of having loaded the frag file, so we can pull it directly into the filter. **
        this.filter = new Phaser.Filter(this.game, uniforms, this.cache.getShader('ripples'));

        // adds ripples filter in 800x600 size
        this.filter.addToWorld(0, 0, 800, 600);
        
        this.uniform = this.filter.uniforms.color.value;

        // adds the digits to the screen from the digits png file
        this.timeText = this.add.bitmapText(this.world.centerX + 32, 128, 'digits', '10', 1024);
        // centered
        this.timeText.anchor.set(0.5);
        this.timeText.alpha = 0.3;

        this.stars = this.add.group();

        // Create the car sprite
        this.target = this.add.sprite(400, 200, 'sprite');
        this.target.inputEnabled = true;
        // scale it
        this.target.scale.set(2);
        // line stops it from blurring the pixel art when scaled up. 
        this.target.smoothed = false;

        // clickable, event from click
        this.target.events.onInputDown.add(this.clickedIt, this);

        // created a rectangle object for a quake/tremor effect
        // The rectangle is only 6x6 pixels in size and is positioned on the x and y coordinates of the alien sprite
        this.tremorRect = new Phaser.Rectangle(this.target.x, this.target.y, 6, 6);

        // the score at the top left and all its good stuff.. its invisible until the timer runs out
        this.scoreText = this.add.bitmapText(64, 12, 'fat-and-tiny', 'SCORE: 0', 32);
        this.scoreText.tint = 0xffff00;
        // makes it invisible
        this.scoreText.visible = false;

        this.timer = this.time.create(false);
        // The timeUp method will be called after 10,000 milliseconds have elapsed 
        this.timer.add(10000, this.timeUp, this);
        this.timer.start();

        //  Press P to pause and resume the game
        // just assingning it to letter p on keyboard on code below
        this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        // on down command to trigger
        this.pauseKey.onDown.add(this.togglePause, this);

        //  Press D to toggle the debug display
        this.debugKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        // on down command to trigger it
        this.debugKey.onDown.add(this.toggleDebug, this);

        //  Start the colors tweening
        this.add.tween(this.colors).to({
            r: 0.2,
            g: 1.0,
            b: 0.2
        }, 10000, "Linear", true);

    },

    // have to include this also or pause still wont work
    togglePause: function () {

        this.game.paused = (this.game.paused) ? false : true;

    },

    // and for debug too
    toggleDebug: function () {

        this.showDebug = (this.showDebug) ? false : true;

    },

    // When the alien is clicked the clickedIt method is called. Moves the car to a new position
    clickedIt: function (sprite, pointer) {

        // first thing the method does is to place a new star sprite down exactly where you clicked
        var flash = this.stars.create(pointer.x, pointer.y, 'sprite', 1);
        flash.anchor.set(0.5);

        // This is then faded out to an alpha value of 0.2 over the duration of one second
        this.add.tween(flash).to({
            alpha: 0.2
        }, 1000, "Linear", true);

        // pick coordinates for the car sprite and the tremor
        var x = this.rnd.between(0, this.game.width - this.target.width);
        var y = this.rnd.between(0, this.game.height - this.target.height);

        // with the coordinates the target is moved there
        this.target.x = x;
        this.target.y = y;

        // also the tremor is moved
        this.tremorRect.x = x;
        this.tremorRect.y = y;

    },

    update: function () {

        // To create the shaking effect we can take advantage of a method built in to the Rectangle class called random. We call this from our update loop
        this.tremorRect.random(this.target);

        if (this.timeText.visible) {
            this.timeText.text = 10 - Math.floor(this.timer.seconds);
        }

        //  sync our tweened color values into the shader
        this.uniform[0] = this.colors.r;
        this.uniform[1] = this.colors.g;
        this.uniform[2] = this.colors.b;

        this.filter.update();

    },

    // when the timer is done this is called
    timeUp: function () {

        // hides the large time digits from the game background
        this.timeText.text = "";
        this.timeText.visible = false;

        // And we disable input events on the alien 
        this.target.inputEnabled = false;

        // fade him away over the duration of 1 second.
        var tween = this.add.tween(this.target).to({
            alpha: 0
        }, 1000, "Linear", true);

        this.scoreText.visible = true;

        //  Did you score anything?
        if (this.stars.total > 0) {
            tween.onComplete.addOnce(this.displayStars, this);
        } else {
            this.time.events.add(2000, this.gameOver, this);
        }

    },

    displayStars: function () {

        // internal counter set to 0
        this._i = 0;

        // every star in group is sent to show start method
        this.stars.forEach(this.showStar, this);

    },

    // 3 tweens are added for each star
    showStar: function (star) {

        // The first fades the star back in again to alpha 1. This happens over the course of 250ms, so is nice and fast
        this.add.tween(star).to({
            alpha: 1
        }, 250, "Linear", true, this._i * 250);

        // The second tween moves the star to x32 using aSine.easeIn ease
        this.add.tween(star).to({
            x: 32
        }, 750, "Sine.easeIn", true, (this._i * 250) + 250);

        // final tween moves it to y 32 using a Sine.easeOut tween both this and the last tween take 750ms to complete
        var tween = this.add.tween(star).to({
            y: 32
        }, 750, "Sine.easeOut", true, (this._i * 250) + 250);

        this._i++;

        // When the tween completes it calls the addScore method. The boolean at the end dictates if it’s the last star to be set-up or not.
        if (this._i === this.stars.total) {
            tween.onComplete.add(this.addScore, this, 0, true);
        } else {
            tween.onComplete.add(this.addScore, this, 0, false);
        }

    },

    addScore: function (tween, star, lastStar) {

        // The score text is updated
        this.score++;
        this.scoreText.text = "SCORE: " + this.score;

        // and if it’s the last star we wait 2seconds then end the game
        if (lastStar) {
            this.time.events.add(2000, this.gameOver, this);
        }

    },

    // game over functions
    gameOver: function () {

        if (this.score > Clicker.score) {
            Clicker.score = this.score;
        }

        // goes back to main menu state
        this.state.start('Clicker.MainMenu');

    },

    render: function () {

        // when you press D it will show this text
        if (this.showDebug) {
            this.game.debug.text("Duration: " + this.timer.seconds, 32, 32);
            this.game.debug.text("R: " + this.colors.r, 32, 128);
            this.game.debug.text("G: " + this.colors.g, 32, 128 + 32);
            this.game.debug.text("B: " + this.colors.b, 32, 128 + 64);
        }

    },

};


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.state.add('Clicker.Preloader', Clicker.Preloader);
game.state.add('Clicker.MainMenu', Clicker.MainMenu);
game.state.add('Clicker.Game', Clicker.Game);

game.state.start('Clicker.Preloader');