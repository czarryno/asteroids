const WIDTH = 1280;
const HEIGHT = 720;
const FRICTION = .5;
const ROTATE_SPEED = 180;
var LEVEL = 1;
var LIVES = 3;
var gameOver = false;
var invincibleTime = 1000;

var backBuffer = document.createElement("canvas");
var backBufferContext = backBuffer.getContext("2d");
backBuffer.height = 50;
backBuffer.width = WIDTH;
//document.body.appendChild(backBuffer);

var screen = document.createElement("canvas");
var screenContext = screen.getContext("2d");
screen.height = HEIGHT;
screen.width = WIDTH;
document.body.appendChild(screen);

var warpCheck = false;

var rocket = {
	position: {
		x: WIDTH/2,
		y: HEIGHT/2
	},
	degOfRot: 0,
	angle: (90/180)*Math.PI,
	radius: 15,
	forwardThrust: {
		x: 0,
		y: 0
	},
	thrustersOn: false,
	lasers: [],
	collision: 0,
	color: "yellow",
	warpTime: -2000
}

window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

setInterval(loop, 1000 / 30);

var score = 0;
var thrusterAud = new Audio ('audio/Explosion2.wav');
//Audio from bfxr.net, protected under the Creative Commons License. 
function keyDownHandler(event){
	switch(event.key){
		case ' ':
			shootLasers();
			break;
		case 'ArrowUp':
		case 'w':
			rocket.thrustersOn = true;
			break;
		case 'ArrowLeft':
		case 'a':
			rocket.degOfRot = Math.PI/30;
			break;
		case 'ArrowRight':
		case 'd':
			rocket.degOfRot = -Math.PI/30;
			break;
		case 'r':
			warpCheck = true;
			//warp();
			break;
		case 'v':
			if(gameOver){
				location.reload();
			}
			break;
	}	
}

function keyUpHandler(event){
	switch(event.key){
		case ' ':
			break;
		case 'ArrowUp':
		case 'w':
			rocket.thrustersOn = false;
			break;
		case 'ArrowLeft':
		case 'a':
			rocket.degOfRot = 0;
			break;
		case 'ArrowRight':
		case 'd':
			rocket.degOfRot = 0;
			break;
		case 'r':
			warpCheck = false;
			break;
	}		
}


var time = 0;
function loop(){
	if(gameOver !== true){
		renderScoreAndLives();
		updateRocket();
		drawRocket();
		drawAsteroid();
		checkForNewLevel();
		drawLasers();
		laserToAsteroid();
		asteroidToAsteroid();
		for(var i = 0; i < asteroids.length; i++){
			if(rocketToAsteroid()){
				//time = Date.now();
				break;
				console.log("yes");
			}
		}
		warp();
		checkForEndGame();
	}
	else{
		screenContext.clearRect(0,0,WIDTH,HEIGHT);
		screenContext.fillStyle = "gray";
		screenContext.fillRect(0,0, WIDTH, HEIGHT);
		screenContext.fillStyle = "black";
		screenContext.font = "50px Arial";
		screenContext.textAlign = "center";
		screenContext.fillText("GAME OVER!", WIDTH/2, HEIGHT/2);
		screenContext.fillStyle = "black";
		screenContext.font = "30px Arial";
		screenContext.textAlign = "center";
		screenContext.fillText("Final Score: " + score, WIDTH/2, HEIGHT/2 + 50);
		screenContext.fillStyle = "black";
		screenContext.font = "30px Arial";
		screenContext.textAlign = "center";
		screenContext.fillText("Press V to Play Again!", WIDTH/2, HEIGHT/2+ 100);
		
	}
	
}

function drawRocket(){
	screenContext.save();
	screenContext.strokeStyle = rocket.color;
	screenContext.lineWidth = 1.5;
	screenContext.beginPath();
	screenContext.moveTo(
		rocket.position.x + 4/3*rocket.radius * Math.cos(rocket.angle),
		rocket.position.y - 4/3*rocket.radius * Math.sin(rocket.angle)
	);
	screenContext.lineTo(
		rocket.position.x - rocket.radius * (2/3*Math.cos(rocket.angle) + Math.sin(rocket.angle)),
		rocket.position.y + rocket.radius * (2/3*Math.sin(rocket.angle) - Math.cos(rocket.angle))
	);
	screenContext.lineTo(
		rocket.position.x - rocket.radius * (2/3*Math.cos(rocket.angle) - Math.sin(rocket.angle)),
		rocket.position.y + rocket.radius * (2/3*Math.sin(rocket.angle) + Math.cos(rocket.angle))
	);
	screenContext.closePath();
	screenContext.stroke();
	screenContext.restore();
	
	screenContext.strokeStyle = "green"
	screenContext.beginPath();
	screenContext.arc(rocket.position.x, rocket.position.y, 20 , Math.PI*2, false);
	screenContext.stroke();
	
	
}

function updateRocket(){
	screenContext.fillStyle = "black";
	screenContext.fillRect(0,0, WIDTH, HEIGHT);
	if(rocket.thrustersOn === true){
		rocket.forwardThrust.x += Math.cos(rocket.angle)/30 * 5;
		rocket.forwardThrust.y -= Math.sin(rocket.angle)/30 * 5;
	}
	else{
		rocket.forwardThrust.x -= rocket.forwardThrust.x * FRICTION / 30;
		rocket.forwardThrust.y -= rocket.forwardThrust.y * FRICTION / 30;
	}
	
	rocket.angle += rocket.degOfRot;
	
	rocket.position.x += rocket.forwardThrust.x;
	rocket.position.y += rocket.forwardThrust.y;
	
	if(rocket.position.x < -15){
		rocket.position.x = WIDTH;
	}
	if(rocket.position.y < -15){
		rocket.position.y = HEIGHT;
	}
	if(rocket.position.x > WIDTH + 15){
		rocket.position.x = 0;
	}
	if(rocket.position.y >HEIGHT + 15){
		rocket.position.y = 0;
	}
}

var asteroids = [];
var asteroidX = 0;
var asteroidY = 0;
var asteroidSize = 0;
var asteroidEdges = 0;

function manageAsterArr(){
	asteroids = [];
	for(var i = 0; i < LEVEL + 9; i++){
		do{
			asteroidX = Math.floor(Math.random()*1280);
			asteroidY = Math.floor(Math.random()*720);
			asteroidSize = Math.floor(Math.random()*4) + 1;
			asteroidEdges = Math.floor(Math.random()*3) + 5;
			asteroidRadius = Math.abs(Math.random()*90) + 15;
		}while (Math.sqrt(Math.pow(asteroidX - rocket.position.x, 2) + 
			Math.pow(asteroidY - rocket.position.y, 2)) < 175);
		
		/*asteroidX = 300;
		asteroidY = 300;
		asteroidSize = 4;
		asteroidEdges = 5;*/
		
		asteroids.push(new Asteroid(asteroidX, asteroidY, asteroidSize, asteroidEdges, asteroidRadius));
	}
}

function drawAsteroid(){
	var count = 0;
	for(var i = 0; i < asteroids.length; i++){
		asteroids[i].render();
		asteroids[i].update(); 
		count++;
	}
}

function Asteroid(x, y, size, edges, radius){
	randX = Math.random();
	randY = Math.random();
	if(randX <= .5){
		randX = -1;
	}
	else{
		randX = 1;
	}
	if(randY <= .5){
		randY = -1;
	}
	else{
		randY = 1;
	}
	this.position = {
		asterX: x,
		asterY: y
	}
	this.velocity = {
		x: Math.random() * 1.75 * randX,
		y: Math.random() * 1.75 * randY
	}
	this.radius = Math.abs(radius) + 10;
	this.size = size;
	this.color = "white";
	this.angle =  Math.random() * Math.PI * 2;
	this.randomNum = Math.floor(Math.random()*4) + 1;
	this.acceleration = {
		x: Math.sin(this.angle),
		y: Math.cos(this.angle)
	}
	this.height = this.radius*2;
	this.width = this.radius*2;
	this.edges = edges;
	this.dead = false;
	this.aX = 0;
	this.aY = 0;
	if(this.radius <= 50){
		this.level = 1;
	}
	else if(this.radius > 50 && this.radius < 90){
		this.level = 2;
	}
	else{
		this.level = 3;
	}
	this.mass = this.radius;
}

Asteroid.prototype.update = function(){
	this.position.asterX += this.velocity.x;
	this.position.asterY += this.velocity.y;
	
	if(this.position.asterX < -this.width/2){
		this.position.asterX = WIDTH;
	}
	if(this.position.asterY < -this.width/2){
		this.position.asterY = HEIGHT;
	}
	if(this.position.asterX > WIDTH + this.width/2){
		this.position.asterX = 0;
	}
	if(this.position.asterY > HEIGHT + this.height/2){
		this.position.asterY = 0;
	}
}

Asteroid.prototype.render = function(){
	/*screenContext.save();
	screenContext.strokeStyle = "red";
	screenContext.beginPath();
	var x = 0;
	var y = 0;
	screenContext.moveTo(
		this.position.asterX + this.radius * Math.cos(this.angle),
		this.position.asterY + this.radius * Math.sin(this.angle)
	);
	for(var i = 0; i < this.edges + 1; i++){
		screenContext.lineTo(
			this.position.asterX + this.radius * Math.cos(this.angle + i * Math.PI * 2 / this.edges),
			this.position.asterY + this.radius * Math.sin(this.angle + i * Math.PI * 2 / this.edges)
		);
	}*/
	/*screenContext.moveTo(this.position.asterX, this.position.asterY);
	screenContext.lineTo(this.position.asterX + 10*this.randomNum, this.position.asterY + 30*this.randomNum);
	screenContext.lineTo(this.position.asterX + 40*this.randomNum, this.position.asterY + 25*this.randomNum);
	screenContext.lineTo(this.position.asterX + 30*this.randomNum, this.position.asterY + 15*this.randomNum);
	screenContext.lineTo(this.position.asterX + 40*this.randomNum, this.position.asterY + 5*this.randomNum);
	screenContext.lineTo(this.position.asterX + 30*this.randomNum, this.position.asterY + 10*this.randomNum);
	screenContext.closePath();*/
	//this.radius = 16*this.randomNum;
	//aX = this.position.asterX + 20*this.randomNum;
	//aY = this.position.asterY + 17.5*this.randomNum;
	/*else if(this.edges > 3 && this.edges <= 6){
		screenContext.moveTo(this.position.asterX, this.position.asterY);
		screenContext.lineTo(this.position.asterX + 5*this.randomNum, this.position.asterY + 15*this.randomNum);
		screenContext.lineTo(this.position.asterX + 35*this.randomNum, this.position.asterY+ 5*this.randomNum);
		screenContext.lineTo(this.position.asterX + 20*this.randomNum, this.position.asterY - 10*this.randomNum);
		screenContext.closePath();
		this.radius = 15.5*this.randomNum;
		aX = this.position.asterX + 17.5*this.randomNum;
		aY = this.position.asterY;
	}
	else{
		screenContext.moveTo(this.position.asterX, this.position.asterY);
		screenContext.lineTo(this.position.asterX - 10*this.randomNum, this.position.asterY + 15*this.randomNum);
		screenContext.lineTo(this.position.asterX + 10*this.randomNum, this.position.asterY + 20*this.randomNum);
		screenContext.lineTo(this.position.asterX + 25*this.randomNum, this.position.asterY + 5);
		screenContext.lineTo(this.position.asterX + 15*this.randomNum, this.position.asterY);
		screenContext.closePath();
		this.radius = 13.5*this.randomNum;
		aX= this.position.asterX + 5*this.randomNum;
		aY = this.position.asterY + 10*this.randomNum;
		
	}
	screenContext.stroke();
	screenContext.restore();*/
	
	screenContext.strokeStyle = "grey"
	screenContext.beginPath();
	//screenContext.arc(x, y, this.radius, Math.PI*2, false);
	screenContext.arc(this.position.asterX, this.position.asterY, this.radius , Math.PI*2, false);
	screenContext.stroke();
}


function Laser(angle, laserX, laserY){
	this.position = {
		x: laserX,
		y: laserY
	}
	this.velocity = {
		x: 32*Math.sin(angle),
		y: 32*Math.cos(angle)
	}
	this.radius = 4;
}

function laserToAsteroid(){
	rocket.lasers.forEach(function(laser){
		asteroids.forEach(function(asteroid){
			if(checkCollisions(laser, asteroid) === true){
				console.log("hit");
			}
		});
	});
}

Laser.prototype.update = function(){
	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;
	
	
}

Laser.prototype.render= function(){
	screenContext.strokeStyle = "orange";
	screenContext.beginPath();
	screenContext.arc(this.position.x, this.position.y, 4, Math.PI*2, false);
	screenContext.stroke();
}

function shootLasers(){
	var laserAud = new Audio('audio/Laser_Shoot6.wav');
	//Audio from bfxr.net, protected under the Creative Commons License. 
	var x = rocket.position.x;
	var y = rocket.position.y;
	rocket.lasers.push(new Laser(rocket.angle + 1.57, x, y));
	laserAud.play();
}

function drawLasers(){
	for(var i = 0; i < rocket.lasers.length; i++){
		rocket.lasers[i].render();
		rocket.lasers[i].update();
		if(rocket.lasers[i].position.x < -15){
			rocket.lasers.splice(i, 1);
			console.log("yes1");
		}
		else if(rocket.lasers[i].position.y < -15){
			rocket.lasers.splice(i, 1);
			console.log("yes2");
		}
		else if(rocket.lasers[i].position.x > WIDTH + 15){
			rocket.lasers.splice(i, 1);
			console.log("yes3");
		}
		else if(rocket.lasers[i].position.y > HEIGHT + 15){
			rocket.lasers.splice(i, 1);
			console.log("yes4");
		}
		else{
			
		}
	}
}
var rocketExplodeAud = new Audio('audio/rocketExplosion.wav');
//Audio from bfxr.net, protected under the Creative Commons License. 
function rocketToAsteroid(){
	var helper = false;
	time = Date.now();
	if(time - rocket.collision < 3275 || warpTimer - rocket.warpTime < 2000){
		//document.getElementById("invincible").innerHTML = "Invincibility Time: " + -Math.ceil(((time - rocket.collision)/3.275) - 999);
		//console.log("invincible time");
		document.getElementById("invincible").innerHTML = "Invincibility Status: INVINCIBLE!"
		rocket.color = "red";
		//return false;
		
	}
	else{
		if(time - rocket.collision < 3375 || warpTimer - rocket.warpTime < 1100){
			rocket.color = "yellow";
		}
		else{
			document.getElementById("invincible").innerHTML = "Invincibility Status: VULNERABLE!"
			rocket.color = "yellow";
			for(var i = 0; i < asteroids.length; i++){
				if(Math.pow(rocket.position.x - asteroids[i].position.asterX, 2) + Math.pow(asteroids[i].position.asterY - rocket.position.y, 2) <= 
				   Math.pow(asteroids[i].radius + 20, 2)){
					   LIVES -= 1;
					   rocketExplodeAud.play();
					   rocket.collision = time;
					   rocket.color = "red";
					   console.log("Collision");
					   console.log("X of Aster" + asteroids[i].position.asterX);
					   console.log("Y of Aster" +asteroids[i].position.asterY);
					   console.log("X of Rocket" + rocket.position.x);
					   console.log("Y of Rocket" + rocket.position.y);
					   /*var helper = true;
					   while(helper){
						   for(var j = 0; j < asteroids.length; j++){
						   rocket.position.x = (Math.random()*WIDTH);
						   rocket.position.y = (Math.random()*HEIGHT);
						   rocket.forwardThrust.x = 0;
						   rocket.forwardThrust.y = 0;
						   rocket.angle = 1.57;
						   if(asteroids[j].position.asterX + asteroids[j].radius !== rocket.position.x
						   && asteroids[j].position.asterY + asteroids[j].radius !== rocket.position.y){
							   helper = false;
						   }
						   else{
							   helper = true;
						   }
					   }
					   }*/
					   do{
						   rocket.position.x = (Math.random()*WIDTH);
						   rocket.position.y = (Math.random()*HEIGHT);
						   rocket.forwardThrust.x = 0;
						   rocket.forwardThrust.y = 0;
						   rocket.angle = 1.57;
					   
					   
					   }while (Math.sqrt(Math.pow(asteroids[i].position.asterX - rocket.position.x, 2) + 
								Math.pow(asteroids[i].position.asterY - rocket.position.y, 2)) < 20 + asteroids[i].radius)
					   //var helper = true;
					   /*do{
						   
						   //console.log(rocket.position.x);
						   //console.log(asteroids[i].position.x);
						   //console.log("yes");
						   console.log(Math.pow(rocket.position.x - asteroids[i].position.asterX, 2) + Math.pow(asteroids[i].position.asterY - rocket.position.y, 2));
						   console.log(Math.pow(asteroids[i].radius + 50, 2));
					   }while (Math.sqrt(Math.pow(asteroids[i].position.asterX - rocket.position.x, 2) + 
							   Math.pow(asteroids[i].position.asterY - rocket.position.y, 2)) < 175)*/
						
				   }
			   if(helper === true){
				   break;
			   }
		}		
	}
		//console.log("time is up");
	}
	
	//console.log(time);
	
	
}

function laserToAsteroid(){
	
	for(var i = 0; i < rocket.lasers.length; i++){
		for(var j = 0; j < asteroids.length; j++){ 
			if(Math.pow(rocket.lasers[i].position.x - asteroids[j].position.asterX, 2) + 
			   Math.pow(asteroids[j].position.asterY - rocket.lasers[i].position.y, 2) <= 
			   Math.pow(asteroids[j].radius + 4, 2)){
				   console.log("HITHITHITHIT!~");
				   splitOrDestroy(asteroids[j], j);
				   rocket.lasers.splice(i, 1);
				   break;
			   }
		}
	}
}

function checkCollisions(first, second){
	if(Math.pow(second.position.asterX - first.position.x, 2) + 
	   Math.pow(second.position.asterY - first.position.y, 2) <=
	   Math.pow(second.radius,4)){
		return true;
	}
	else return false;
}

function splitOrDestroy(asteroid, index){
	if(asteroid.level === 1){
		console.log("Asteroid destroyed");
		score += 10;
		console.log(score);
		asteroids.splice(index, 1);
	}
	else if(asteroid.level === 2){
		var oldMass = asteroid.mass;
		var lvlOneMass = Math.floor(Math.random()*15) + 20;
		var xMod2 = oldMass - lvlOneMass;
		var changedVelocityX2 = asteroid.velocity.x*(lvlOneMass/oldMass);
		var changedVelocityY2 = asteroid.velocity.y*(lvlOneMass/oldMass);
		var astrOne = new Asteroid(asteroid.position.asterX-xMod2-5, asteroid.position.asterY, 0, 0, lvlOneMass-10);
		astrOne.velocity.x = -Math.abs(changedVelocityX2);
		astrOne.velocity.y = -Math.abs(changedVelocityY2);
		//astrOne.mass = astrOne.radius;
		asteroids.push(astrOne);
		var secondMass = oldMass - lvlOneMass;
		var astrSecondVelX2 = asteroid.velocity.x - astrOne.velocity.x;
		var astrSecondVelY2 = asteroid.velocity.y - astrOne.velocity.y;
		var secondVelocityX = Math.abs(astrSecondVelX2);
		var secondVelocityY = Math.abs(astrSecondVelY2);
		var astrTwo = new Asteroid(asteroid.position.asterX+lvlOneMass+5, asteroid.position.asterY, 0, 0, secondMass-10);
		astrTwo.velocity.x = secondVelocityX;
		astrTwo.velocity.y = secondVelocityY;
		asteroids.push(astrTwo);
		asteroids.splice(index, 1);
		console.log("OrignialLvlTwo rad: " + asteroid.radius);
		console.log("astrOne rad: " + astrOne.radius);
		console.log("astrTwo rad: " + astrTwo.radius);
		console.log("lvlTwo");
	}
	else{
		console.log("Lvl Three Asteroid X:" + asteroid.position.asterX);
		var lvlThreeMass = asteroid.radius;
		var newLvlTwoMass = Math.floor(Math.random()*40) + 15;
		var xMod = lvlThreeMass - newLvlTwoMass;
		var changedVelocityX = asteroid.velocity.x*(newLvlTwoMass/lvlThreeMass);
		var changedVelocityY = asteroid.velocity.y*(newLvlTwoMass/lvlThreeMass);
		var astrFirst = new Asteroid(asteroid.position.asterX-(xMod)-10, asteroid.position.asterY, 0, 0, newLvlTwoMass-10);
		console.log("Lvl Two Asteroid X:" + astrFirst.position.asterX);
		astrFirst.velocity.x = -Math.abs(changedVelocityX);
		astrFirst.velocity.y = -Math.abs(changedVelocityY);
		//astrFirst.mass = astrFirst.radius;
		asteroids.push(astrFirst);
		var remainMass = lvlThreeMass - newLvlTwoMass;
		var astrSecondVelX = asteroid.velocity.x - astrFirst.velocity.x;
		var astrSecondVelY = asteroid.velocity.y - astrFirst.velocity.y;
		var astrSecond = new Asteroid(asteroid.position.asterX+(newLvlTwoMass)+10, asteroid.position.asterY, 0, 0, remainMass-10);
		//astrSecond.mass = astrSecond.radius;
		astrSecond.velocity.x = Math.abs(astrSecondVelX);
		astrSecond.velocity.y = Math.abs(astrSecondVelY);
		asteroids.push(astrSecond);
		console.log("astrFirst radius: " + astrFirst.radius);
		console.log("astrSecond radius: " + astrSecond.radius);
		asteroids.splice(index, 1);
		console.log("lvlThree");
	}
}
var lifeArr = [];
function renderScoreAndLives(){
	var count = 0;
	document.getElementById("score").innerHTML = "Score: " + score;
	document.getElementById("title").innerHTML = "Asteroids";
	document.getElementById("lives").innerHTML = "Lives: " + LIVES;
	document.getElementById("level").innerHTML = "Level: " + LEVEL;
	for(var i = 0; i <asteroids.length; i++){
		count++;
	}
	document.getElementById("remain").innerHTML = "Asteroids Remaining: " + count;
}

function checkForEndGame(){
	if(LIVES <= 0){
		gameOver = true;
		document.getElementById("score").innerHTML = "";
		document.getElementById("title").innerHTML = "";
		document.getElementById("lives").innerHTML = "";
		document.getElementById("level").innerHTML = "";
		document.getElementById("remain").innerHTML = "";
		document.getElementById("invincible").innerHTML = "";
		document.getElementById("warpTimerText").innerHTML = "";
	}
}

function checkForNewLevel(){
	if(asteroids.length === 0){
		LEVEL += 1;
		manageAsterArr();
	}
}
var warpTimer = 0;
function warp(){
	
	warpTimer = Date.now();
	if(warpTimer - rocket.warpTime < 20500){
		//console.log("Warp not Ready!");
		document.getElementById("warpTimerText").innerHTML = "Warp Not Ready!";
	}
	else{
		document.getElementById("warpTimerText").innerHTML = "Warp Ready!";
		if(warpCheck === true){
			for(var j = 0; j < asteroids.length; j++){
			var x = Math.random()*WIDTH;
			var y = Math.random()*HEIGHT;
			if(!Math.pow(x - asteroids[j].position.asterX, 2) + 
				   Math.pow(asteroids[j].position.asterY - y, 2) <= 
				   Math.pow(asteroids[j].radius + 20, 2)){
					   rocket.position.x = x;
					   rocket.position.y = y;
					   //console.log("good spot");
			}
			}	
			//rocket.collision = 0;
			//time = 0;
			rocket.warpTime = time;
			//rocketToAsteroid();
		}
		
		
	}
	
}

function asteroidToAsteroid(){
	for(var j = 0; j < asteroids.length; j++){
		for(var i = 0; i < asteroids.length; i++){
			if(i != j && Math.pow(asteroids[j].position.asterX - asteroids[i].position.asterX, 2) + Math.pow(asteroids[j].position.asterY - asteroids[i].position.asterY, 2) <= 
			    Math.pow(asteroids[j].radius + asteroids[i].radius, 2)){
				//console.log("asteroids have collided");
			}
		}
	}
}

manageAsterArr();



