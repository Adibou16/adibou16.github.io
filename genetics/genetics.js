var rockets;
var population;
var lifespan = 400;
var gen = 0;
var wins = 0;
var maxfit = 0;
var count = 0;
var target;
var canvas;
var maxforce = 0.2;

var lifeP;
var genP;
var maxfitP;
var winsP;

var rx = 200;
var ry = 300;
var rw = 400;
var rh = 20;

function centerCanvas() {
	var wx = (windowWidth - width) / 2;
	var wy = (windowHeight - height) / 2;
	canvas.position(wx, wy);
}

function setup() {
	canvas = createCanvas(800, 600);
	centerCanvas();
	rockets = new Rocket();
	population = new Population();
	lifeP = createP();
	genP = createP();
	maxfitP = createP();
	winsP = createP();
	target = createVector(width/2, 100);
}

function windowResized() {
	centerCanvas();
}

function draw() {
	background(0);
	population.run();
	lifeP.html("Frame Count:" + count + "/400");
	genP.html("Gen:" + gen);
	maxfitP.html("Best Rocket Score:" + round(maxfit));
	winsP.html("Number of Wins:" + wins);

	count++;

	if (count == lifespan){
		population.evaluate();
		population.selection();
		gen++; 
		count = 0;
	}

	fill(255);
	rect(200, 300, 400, 20);

	ellipse(target.x, target.y, 32, 32);
}




function DNA(genes) {
	if (genes) {
		this.genes = genes;
	} else {
		this.genes = [];
		for (var i = 0; i < lifespan; i++) {
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(maxforce);
		}
	}

	this.crossover = function(partner) {
		var newgenes = [];
		var mid = floor(random(this.genes.length));
		for (var i = 0; i < this.genes.length; i++) {
			if (i > mid) {
				newgenes[i] = this.genes[i];
			} else {
				newgenes[i] = partner.genes[i];
			}
		}
		return new DNA(newgenes);
	}

	this.mutation = function() {
		for (var i = 0; i < this.genes.length; i++) {
			if (random(1) < 0.01) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxforce);
			}
		}
	}

}



function Population() {
	this.rockets = [];
	this.popsize = 25;
	this.matingpool = [];

	for (var i = 0; i <this.popsize; i++){
		this.rockets[i] = new Rocket;
	}

	
	this.evaluate = function() {
		for (var i = 0; i <this.popsize; i++) {
			this.rockets[i].calcFitness();
			if (this.rockets[i].fitness > maxfit) {
				maxfit = this.rockets[i].fitness;
			}
		}

	    this.matingpool = [];
		
		for (var i = 0; i <this.popsize; i++) {
			var n = this.rockets[i].fitness * 100;
			this.rockets[i].fitness /= maxfit;

			for (var j = 0; j < n; j++) {
				this.matingpool.push(this.rockets[i]);
			}
		}
	}

	this.selection = function() {
		var newRockets = [];
		for (var i = 0; i < this.rockets.length; i++) {
			var parentA = random(this.matingpool).dna;
			var parentB = random(this.matingpool).dna;
			var child = parentA.crossover(parentB);
			child.mutation();
			newRockets[i] = new Rocket(child);
		}
		this.rockets = newRockets;
	}


	this.run =  function() {
		for (var i = 0; i < this.popsize; i++){
			this.rockets[i].update();
			this.rockets[i].show();	
		}
	}
}



function Rocket(dna) {
	this.pos = createVector(width/2, height);
	this.vel = createVector();
	this.acc = createVector();
	this.completed = false;
	this.crshed = false;

	if (dna) {
		this.dna = dna;
	} else {
	    this.dna = new DNA();
	}

	this.fitness = 0;

	this.applyForce = function(force) {
		this.acc.add(force);
	}

	this.calcFitness = function() {
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);	
		this.fitness = map(d, 0, width, width, 0);

		if (this.completed) {
			this.fitness *= 10;
			wins++;
		}

		if (this.crashed) {
			this.fitness /= 10;
		}
	}

	for (var i = 0; i <this.popsize; i++){
		this.rockets[i].fitness /= maxfit;
	}

	this.update = function() {
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);
		if (d < 10) {
			this.completed = true;
			this.pos = target.copy();
		}

		if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
			this.crashed = true;
		}

		if (this.pos.x > width || this.pos.x < 0) {
			this.crashed = true;
		}

		if (this.pos.y > height || this.pos.y < 0) {
			this.crashed = true;
		}

		this.applyForce(this.dna.genes[count]);
		if (!this.completed && !this.crashed) {
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.vel.limit(4);
		}
	}	
	
	this.show = function()  {
		push();
		noStroke();
		fill(255, 150);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER);
		rect(0, 0, 50, 10);
		pop();
	}
}