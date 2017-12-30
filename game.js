var Clicker = {
    score: 0
};



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.state.add('Clicker.Preloader', Clicker.Preloader);
game.state.add('Clicker.MainMenu', Clicker.MainMenu);
game.state.add('Clicker.Game', Clicker.Game);

game.state.start('Clicker.Preloader');

