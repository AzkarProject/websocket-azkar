//

Robot = function (index, game, player) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		down:false		
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		down:false
	}

    var x = 0;
    var y = 0;

    this.game = game; // le word 
    this.player = player;	// le joueur 
	this.currentSpeed =0; // vitesse actuelle
    
    this.robot = game.add.sprite(x, y, 'enemy', 'car');   // l'image du robot   
    this.robot.anchor.set(0.5);     
    this.robot.id = index;

    game.physics.enable(this.robot, Phaser.Physics.ARCADE); // activer les loi de la phisic

    this.robot.body.immovable = false;
    this.robot.body.collideWorldBounds = true;
    this.robot.body.bounce.setTo(0, 0);
    this.robot.angle = 0;

    game.physics.arcade.velocityFromRotation(this.robot.rotation, 0, this.robot.body.velocity);

};

Robot.prototype.update = function() {
        
       
    
    if (this.cursor.left)
    {
        this.robot.angle -= 1;
    }
    else if (this.cursor.right)
    {
        this.robot.angle += 1;
    }    
    if (this.cursor.up)
    {
        //  The speed we'll travel at
        this.currentSpeed = 300;
    }
    else
    {
        if (this.currentSpeed > 0)
        {
            this.currentSpeed -= 4;
        }
    }
      
    
    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.robot.rotation, this.currentSpeed, this.robot.body.velocity);
    }    
    else
    {
        game.physics.arcade.velocityFromRotation(this.robot.rotation, 0, this.robot.body.velocity);
    }    
      
};


var game = new Phaser.Game(620, 350, Phaser.AUTO, 'simulateur-area2', { preload: preload, create: create, update: update, render: render });


function preload () {

    game.load.atlas('car', 'images/car.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    
}


/*CREATION DU MONDE */
function create () { 

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 620, 350, 'earth'); // la carte de jeu peut etre ....
    land.fixedToCamera = true;
    
    	
	player = new Robot(myId, game, robot);
	robot = player.robot;
	robot.x=0;
	robot.y=0;
	
    robot.bringToTop();
 
    game.camera.follow(robot);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
	
}



function update () {
	//do not update if client not ready
	if (!ready) return;
	
	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;
	
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

}














function render () {}

