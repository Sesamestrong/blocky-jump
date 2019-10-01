/*
You can use fillRect, clearRect, and strokeRect for rectangles.
You can make shapes with beginPath, moveTo,lineTo,stroke,closePath and fill.
ctx.arc(x,y,radius,startAngle,radians to endAngle,counterclockwise (true) or not)
ctx.arcTo(x1,y1,x2,y2);
*/
var xVel = 0;
var yVel = 0;
var maxYVel = 10;
var maxXVel = 5;
var currentLevel;
const playerWidth = 8;
const playerHeight = 8;
const blocksWide = 50;
const blocksTall = 50;
var initColor = (150, 150, 150);
const blockWidth = 10;
const blockHeight = 10;
const screenWidth = blocksWide * blockWidth;
const screenHeight = blocksTall * blockHeight;
var canvas;
var ctx;
var down = false;
var up = false;
var left = false;
var right = false;
var x = screenWidth / 2;
var y = screenHeight / 2;
var xBlock = getBlock(blockWidth, x);
var yBlock = getBlock(blockHeight, y);
var doVels;
var checkpoint=[blocksTall/2,blocksWide/2];
var gottenCoins=[];
var colors = colors="rgb("+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+")";

function has(bigArray,smallArray){
  for(m in bigArray){
    if(bigArray[m][0]==smallArray[0]&&bigArray[m][1]==smallArray[1]){
      return true;
    }
  }
  return false;
}


function toggleGame(){
  if(doVels){
clearInterval(doVels);
doVels=null;
setupWithArray(currentLevel,isArray=true);
  }
  else{doVels = setInterval(() => {
	moveSomething();
}, 50);}
}

var colors = "rgb("+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+")";

function getBlock(blockDimension, playerLoc) {
	return Math.floor(playerLoc / blockDimension);
}

function setLevel() {
	currentLevel = [];
	for (g = 0; g < blocksTall; g++) {
		currentLevel.push([]);
		for (u = 0; u < blocksWide; u++) {
			if (Math.floor(Math.random() * 4) == 1) {
				currentLevel[g].push(1);
			} else if (Math.floor(Math.random() * 20) == 1) {
				currentLevel[g].push(2);
			} else if (Math.floor(Math.random() * 40) == 1) {
				currentLevel[g].push(3);
			} else {
				currentLevel[g].push(0);
			}
		}
	}
	currentLevel[Math.floor(blocksWide / 2)][Math.floor(blocksTall / 2)] = 0;
	currentLevel[Math.floor(blocksWide / 2)][Math.floor(blocksTall / 2) + 1] = 0;
	currentLevel[Math.floor(blocksWide / 2)][Math.floor(blocksTall / 2) - 1] = 0;
	currentLevel[Math.floor(blocksWide / 2) - 1][Math.floor(blocksTall / 2)] = 0;
	currentLevel[Math.floor(blocksWide / 2) - 1][
		Math.floor(blocksTall / 2) + 1
	] = 0;
	currentLevel[Math.floor(blocksWide / 2) - 1][
		Math.floor(blocksTall / 2) - 1
	] = 0;
	currentLevel[Math.floor(blocksWide / 2) + 1][Math.floor(blocksTall / 2)] = 1;
	currentLevel[Math.floor(blocksWide / 2) + 1][
		Math.floor(blocksTall / 2) + 1
	] = 1;
	currentLevel[Math.floor(blocksWide / 2) + 1][
		Math.floor(blocksTall / 2) - 1
	] = 1; //clear the area around the player, give them a place to stand
	document.getElementById('tutorial').width = screenWidth;
	document.getElementById('tutorial').height = screenHeight;
canvas = document.getElementById('tutorial');
ctx = canvas.getContext('2d');
draw();
 makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
ctx.fillStyle="#000000"
    ctx.font="40px Georgia";
ctx.fillText("Click or press 'R' to start.",30,210);
}
function setupWithArray(stringThing,isArray=false,doDrawing=true) {
  gottenCoins=[];
  document.getElementById("numCoins").innerText=0;
	if(!isArray){let standin = dataToArray(stringThing);if(standin.length==blocksTall&&standin[blocksTall-1].length==blocksWide){currentLevel=standin;}else{alert("Incorrect level dimensions.")}}
	x = blockWidth*checkpoint[1];
	y = blockHeight*checkpoint[0];
  yVel=0;
  xVel=0;
	updateLocations();
 if(doDrawing){
	document.getElementById('tutorial').width = screenWidth;
	document.getElementById('tutorial').height = screenHeight;
  canvas = document.getElementById('tutorial');
ctx = canvas.getContext('2d');
draw();makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
ctx.fillStyle="#000000"
ctx.font="40px Georgia";
ctx.fillText("Click or press 'R' to start.",30,210);}
let theThing=0;
  for(i in currentLevel){
    for(e in currentLevel){
      if(currentLevel[i][e]==7){
        theThing++;
      }
    }
  }
  document.getElementById("totalCoins").innerText=theThing;
}

function dataToArray(data) {
	newArray = [];
	allStuff = data.split(',');
	for (i in allStuff) {
		newArray.push([]);
		for (e in allStuff[i]) {
			newArray[i].push(parseInt(allStuff[i][e]));
		}
	}
	return newArray;
}

function arrayToData(array){
  newData="";
  firstStep=[];
  for(i in array){
    firstStep.push(array[i].join(""));
  }
  newData=firstStep.join(",");
  return newData;
}

function makeRect(color, size) {
		
			ctx.fillStyle = color;
		ctx.fillRect(size[0], size[1], size[2], size[3]);
	}
function draw() {
	

	function renderScreen(toRender) {
		(count1 = -1), (count2 = -1);
		ctx.fillStyle = 'rgb(0,0,0)';
		ctx.fillRect(0, 0, screenWidth, screenHeight);
		for (
			i = yBlock - Math.floor(blocksTall / 2) - 1;
			i < yBlock + Math.floor(blocksTall / 2) + 1;
			i++
		) {
			count1++;
			count2 = -1;
			for (
				e = xBlock - Math.floor(blocksWide / 2) - 1;
				e < xBlock + Math.floor(blocksWide / 2) + 1;
				e++
			) {
				count2++;
				if (i >= 0 && i < blocksTall && e >= 0 && e < blocksWide) {
					if (toRender[i][e] == 0) {
						/*ctx.fillStyle =
							'rgb(' +
							colors[0][0] +
							',' +
							colors[0][1] +
							',' +
							colors[0][2] +
							')';*/
						ctx.fillStyle = 'rgb(255,255,255)';
					} else if (toRender[i][e] == 1) {
						ctx.fillStyle=colors;
					} else if (toRender[i][e] == 2) {
						ctx.fillStyle = 'rgb(25,150,255)';
					} else if (toRender[i][e] == 3) {
						ctx.fillStyle = 'rgb(255,0,0)';
					}else if(toRender[i][e]==4){ctx.fillStyle="rgb(0,255,0)";}else if(toRender[i][e]==5){ctx.fillStyle="rgb(100,100,0)";}
          else if(toRender[i][e]==6){ctx.fillStyle="rgb(255,0,200)";}
          else if(toRender[i][e]==7){if(!has(gottenCoins,[i,e])){ctx.fillStyle="gold";}else{ctx.fillStyle="white";}} //Render coins
					/*if (count1 - 1 == blocksTall / 2 && count2 - 1 == blocksWide / 2) {
						ctx.fillStyle = 'rgb(0,0,0)';
					}*/
					ctx.fillRect(
						screenWidth / 2 - blockWidth * (xBlock - e) - x % blockWidth,
						screenHeight / 2 - blockHeight * (yBlock - i) - y % blockHeight,
						blockWidth,
						blockHeight
					);
				}
				ctx.fillStyle = 'rgb(150,150,150)';
				/*newColor=Math.floor(Math.random()*3);
        console.log("hi");
        for(i=0;i<3;i++){
          if(i==newColor){
            initColor[i]+=2;
          }
          else{
            initColor[i]-=1;
          }
        }
        console.log(initColor);*/
			}
		}
		ctx.fillRect(screenWidth / 2, screenHeight / 2, playerWidth, playerHeight);
    /*ctx.font="40px Verdana";
  ctx.fillStyle="gold";
  ctx.fillText("Coins: "+gottenCoins.length,0,40);*/
	}
	ctx.clearRect(0, 0, 500, 500);
	renderScreen(currentLevel);
}
function updateLocations() {
	xBlock = Math.floor(x / blockWidth);
	yBlock = Math.floor(y / blockHeight);
}
document.addEventListener('keydown', getPresses, false);
document.addEventListener('keyup', getUps, false);
var isOnBlock;
function moveSomething() {
	//adjacents=[currentLevel[]]
if (
		y + yVel+playerHeight >= screenHeight - 1 ||
		yBlock >= blocksTall - 1 ||
		currentLevel[yBlock][xBlock] == 3 ||
		currentLevel[yBlock][getBlock(blockWidth, x + playerWidth)] == 3 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][xBlock] == 3 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][
			getBlock(blockWidth, x + playerWidth)
		] == 3
	) {
		clearInterval(doVels);
    doVels=null;
    draw();
    setupWithArray(currentLevel,isArray=true,doDrawing=false);
		ctx.font = '100px Verdana';
		var gradient = ctx.createLinearGradient(0, 0, 0,100);
		gradient.addColorStop('0', 'black');
		gradient.addColorStop('0.5', 'blue');
		gradient.addColorStop('1.0', 'red');
 makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
		ctx.fillStyle = gradient;
		ctx.fillText('You lose.', 0, 100);
    ctx.font="40px Georgia";
ctx.fillText("Click or press 'R' to restart.",20,210);
		return;
	}
	if (yBlock <= 0 || y + yVel <= 0||currentLevel[yBlock][xBlock] == 4 ||
		currentLevel[yBlock][getBlock(blockWidth, x + playerWidth)] == 4 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][xBlock] == 4 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][
			getBlock(blockWidth, x + playerWidth)
		] == 4) {
		clearInterval(doVels);
    doVels=null;
    setupWithArray(currentLevel,isArray=true,doDrawing=false);
		ctx.font = '100px Verdana';
		var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
		gradient.addColorStop('0', 'magenta');
		gradient.addColorStop('0.25', 'blue');
		gradient.addColorStop('0.5', 'red');
		gradient.addColorStop('0.75', 'orange');
		gradient.addColorStop('1.0', 'yellow');
 makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
		ctx.fillStyle = gradient;
		ctx.fillText('You win!', 0, 100);
    checkpoint=[blocksTall/2,blocksWide/2];
    ctx.font="40px Georgia";
ctx.fillText("Click or press 'R' to restart.",20,210);
		return;
	}
  possibleCoins=[[yBlock,xBlock],[yBlock,getBlock(blockWidth,x+playerWidth)],[getBlock(blockHeight,y+playerHeight),xBlock],[getBlock(blockHeight,y+playerHeight),getBlock(blockWidth,x+playerWidth)]];
  for(i in possibleCoins){
    e=possibleCoins[i];
    if(currentLevel[e[0]][e[1]]==7&&!has(gottenCoins,e)){
      gottenCoins.push(e);
      document.getElementById('numCoins').innerText=gottenCoins.length;
    }
  }

  

	if (
		(currentLevel[getBlock(blockHeight, y + playerHeight + yVel)][xBlock] ==
			1 ||
			currentLevel[getBlock(blockHeight, y + playerHeight + yVel)][
				getBlock(blockWidth, x + playerWidth)
			] == 1) &&
		yVel > 0
	) {
		y =
			getBlock(blockHeight, y + playerHeight + yVel) * blockHeight -
			playerHeight -
			1;
		yVel = 0;
		isOnBlock = true;
	} else if (
		currentLevel[yBlock][xBlock] == 2 ||
		currentLevel[yBlock][getBlock(blockWidth, x + playerWidth)] == 2 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][xBlock] == 2 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][
			getBlock(blockWidth, x + playerWidth)
		] == 2
	) {
		isOnBlock = true;
	} else {
		isOnBlock = false;
	}
	if (up && isOnBlock||
		currentLevel[yBlock][xBlock] == 5 ||
		currentLevel[yBlock][getBlock(blockWidth, x + playerWidth)] == 5 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][xBlock] == 5 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][
			getBlock(blockWidth, x + playerWidth)
		] == 5) {
		yVel = -maxYVel;
	}
	/*else if(event.key=="ArrowDown"){
    yVel=-10;
  }
  else{yBlock+=1}*/
	if (
		yVel < 0 &&
		([1,5].includes(currentLevel[getBlock(blockHeight, y + yVel)][xBlock]) ||
			[1,5].includes(currentLevel[getBlock(blockHeight, y + yVel)][
				getBlock(blockWidth, x + playerWidth)
			]) ||
			[1,5].includes(currentLevel[getBlock(blockHeight, y + yVel + playerHeight)][xBlock])||
			[1,5].includes(currentLevel[getBlock(blockHeight, y + playerHeight + yVel)][
				getBlock(blockWidth, x + playerWidth)
			]))
	) {
		y = getBlock(blockHeight, y + yVel) * blockHeight + blockHeight + 1;
		yVel = 0;
	}

	y += yVel;
	if (yVel < 5) {
		yVel++;
	}
	updateLocations();
	if (left) {
		xVel = 0 - maxXVel;
	} else if (right) {
		xVel = maxXVel;
	}
	if (
		(getBlock(blockWidth,x+xVel+playerWidth) >= blocksWide ||
			currentLevel[yBlock][getBlock(blockWidth, x + playerWidth + xVel)] == 1 ||
			currentLevel[getBlock(blockHeight, y + playerHeight)][
				getBlock(blockWidth, x + playerWidth + xVel)
			] == 1) &&
		xVel > 0
	) {
		x =
			getBlock(blockWidth, x + playerWidth + xVel) * blockWidth -
			playerWidth-1;
		xVel = 0;
	} else if (
		(x+xVel < 0 ||
			currentLevel[yBlock][getBlock(blockWidth, x + xVel)] == 1 ||
			currentLevel[getBlock(blockHeight, y + playerHeight)][
				getBlock(blockWidth, x + xVel)
			] == 1) &&
		xVel < 0
	) {
		x = getBlock(blockWidth, x + xVel) * blockWidth + blockWidth + 1;
		xVel = 0;
	}
	if (x + xVel < 0 || x + xVel >= screenWidth) {
		xVel = 0;
    x=screenWidth-playerWidth;
	}
	x += xVel;
	if (xVel > 0) {
		xVel -= 1;
	} else if (xVel < 0) {
		xVel += 1;
	}
  possibleCheckpoints=[[getBlock(blockHeight,y),xBlock],[getBlock(blockHeight,y+playerHeight),xBlock],[getBlock(blockHeight,y),getBlock(blockWidth,x)],[getBlock(blockHeight,y),getBlock(blockWidth,x+playerWidth)]];
  checkPointLoc=null;
  for(i in possibleCheckpoints){
    e=possibleCheckpoints[i];
    if(currentLevel[e[0]][e[1]]==6){checkPointLoc=e;break;}
  }
  if(checkPointLoc){
    checkpoint=checkPointLoc;
  }
	updateLocations();
	draw();
}


function getPresses(event) {
	if (event.key == 'ArrowRight'||event.key.toLowerCase()=='d') {
		right = true;
	} else if (event.key == 'ArrowLeft'||event.key.toLowerCase()=='a') {
		left = true;
	} else if (event.key == 'ArrowUp' || event.key == ' '||event.key.toLowerCase()=='w') {
		up = true;
	} else if (event.key == 'ArrowDown'||event.key.toLowerCase()=='s') {
		down = true;
	}
  else if(event.key.toLowerCase()=='r'){toggleGame();}
}
function getUps(event) {
	if (event.key == 'ArrowRight'||event.key.toLowerCase()=='d') {
		right = false;
	} else if (event.key == 'ArrowLeft'||event.key.toLowerCase()=='a') {
		left = false;
	} else if (event.key == 'ArrowUp' || event.key == ' '||event.key.toLowerCase()=='w') {
		up = false;
	} else if (event.key == 'ArrowDown'||event.key.toLowerCase()=='s') {
		down = false;
	}
}

var socket = io();
function getLevel() {
	socket.emit('get_level', document.f.name.value);
}
socket.on('level_data', (data,colorThing,gravity,side) => {
  clearInterval(doVels);
  if(colorThing){colors=colorThing;}
  if(gravity){maxYVel=gravity;}
  if(side){maxXVel=parseInt(side);}
  checkpoint=[blocksTall/2,blocksWide/2];
	setupWithArray(data);
});
socket.on('not_exist', () => {
	alert('That level does not exist.');
});
