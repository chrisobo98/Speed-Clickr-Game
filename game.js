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
            color: { type: '3fv', value: [ 0.1, 0.3, 0.6 ] }
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


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.state.add('Clicker.Preloader', Clicker.Preloader);
game.state.add('Clicker.MainMenu', Clicker.MainMenu);
game.state.add('Clicker.Game', Clicker.Game);

game.state.start('Clicker.Preloader');


