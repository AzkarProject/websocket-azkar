var game = new Phaser.Game(800, 600, Phaser.AUTO, 'simulateur-area', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('car', '/images/car.png');
    game.load.spritesheet('controller-indicator', '/images/debug/controller-indicator.png', 16,16);
    
   
}

var car;
var aliens;
var cursors;
var pad1 ;
var indicator1;



function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.input.gamepad.start();

    indicator1 = game.add.sprite(40,100, 'controller-indicator');
    indicator1.scale.x = indicator1.scale.y = 2;
    indicator1.animations.frame = 1;


    car = game.add.sprite(400, 300, 'car');
    car.name = 'car';
    car.anchor.set(0.5,0.5);

    game.physics.enable(car, Phaser.Physics.ARCADE);

    car.body.collideWorldBounds = true;
    car.body.bounce.set(0.8);
    car.body.allowRotation = true;
    car.body.immovable = true;

   cursors = game.input.keyboard.createCursorKeys();
   game.input.keyboard.addKeyCapture(107); // le + est appuyé , on augmente la vitesse
   game.input.keyboard.addKeyCapture(109); // le - est appuyé , on diminu la vitesse

   pad1 = game.input.gamepad.pad1;

}

function update() {

     // Pad "connected or not" indicator
    if(game.input.gamepad.supported && game.input.gamepad.active && game.input.gamepad.pad1.connected) {
        indicator1.animations.frame = 0;
    } else {
        indicator1.animations.frame = 1;
    }

    car.body.velocity.x = 0;
    car.body.velocity.y = 0;
    car.body.angularVelocity = 0;

    if (cursors.left.isDown ||(pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1))
    {
        car.body.angularVelocity = -100;
    }
    else if (cursors.right.isDown ||(pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1))
    {
        car.body.angularVelocity = 100;
    }

    if (cursors.up.isDown || (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) < -0.1))
    {
        car.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(car.angle,100));
    }


    if (game.input.keyboard.isDown(107))
    {
        //car.body.velocity.x+=  ;
        car.body.velocity.y++  ;
        console.log("on accelerre la  : " + car.body.velocity );
    }


    if (game.input.keyboard.isDown(109))
    {
        car.velocity -- ;
        console.log("on decelerre la  : " + car.body.velocity );
    }

}

function render() {
    game.debug.spriteInfo(car, 32, 32);

}