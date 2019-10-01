

var width=500;
var height=500;
const getBlock=function(scale,num){return Math.floor(num/scale);};
var doThis;
//Player constants
var xVel = 0;
var yVel = 0;
var zVel = 0;
var maxYVel = 10;
var maxXVel = 5;
var maxZVel = 5;
var currentLevel;
var currentBlocks;
const playerWidth = 8;
const playerHeight = 8;
const playerLength=8;
const blocksWide = 50;
const blocksTall = 50;
const blocksLong = 1;
var initColor = (150, 150, 150);
const blockWidth = 10;
const blockHeight = 10;
const blockLength=10;
const screenWidth = blocksWide * blockWidth;
const screenHeight = blocksTall * blockHeight;
//var canvas;
var toDrawText;
var textCtx;
var totalSimulated=0;

const correspondingColors=[0x000000,"rgb(150,150,150)",0x5555FF,0xFF0000,0x22CC22,0x888822,0xCC00CC,0xFFFF00];
const correspondingOpacities=[0.0,1.0,0.6,0.7,1,0.7,0.5,0.6];
var down = false;
var up = false;
var left = false;
var right = false;
var x = screenWidth / 2;
var y = screenHeight / 2;
var z = 1;
var xBlock = getBlock(blockWidth, x);
var yBlock = getBlock(blockHeight, y);
var zBlock=getBlock(blockLength,z);
var doVels=false;
var checkpoint=[blocksTall/2,blocksWide/2];//Where the player spawns after every death
var gottenCoins=[];//List of coords of all coins
var colors = colors="rgb("+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+")";
const colorArray=[0]
//end player constants

let myURLThing=new URLSearchParams(window.location.search);

if(myURLThing.get("doTutorial")=="true"){
  var toMakeAlerts;
  let isNew=confirm("Is this your first time playing Platformer Jump?");
  let div3d=document.getElementById("tutorial");
  let tutorialDistances;
  let canvas;
  function doApplicableDrawing(){

  tutorialDistances=[div3d.offsetTop+div3d.offsetParent.offsetTop,div3d.offsetLeft+div3d.offsetParent.offsetLeft]
    toMakeAlerts.clearRect(0,0,screen.availWidth,screen.availHeight);
toMakeAlerts.fillStyle="rgba(0,0,0,0.7)";
    toMakeAlerts.fillRect(0,0,screen.availWidth,screen.availHeight);
  if(isNew==0){
    toMakeAlerts.fillStyle="rgb(255,255,255)";
    toMakeAlerts.font="100px Verdana";
    toMakeAlerts.fillText("Welcome to Platformer Jump.",200,500)
    toMakeAlerts.font="50px Verdana";
    toMakeAlerts.fillStyle="rgb(230,230,230)";
    toMakeAlerts.fillText("Click anywhere to continue.",600,600)
  }
  else if(isNew==1){
    toMakeAlerts.fillStyle="rgb(255,255,255)";
    toMakeAlerts.fillText("You are a red sphere.",tutorialDistances[1]-25,tutorialDistances[0]-50);
    toMakeAlerts.clearRect(tutorialDistances[1]+225,tutorialDistances[0]+225,50,50);
    //toMakeAlerts.
  }
  else if(isNew==2){
    toMakeAlerts.fillStyle="rgb(255,255,255)";
    toMakeAlerts.clearRect(tutorialDistances[1]+100,tutorialDistances[0]+150,300,100)
    toMakeAlerts.fillText("Press the 'R' key to play.",tutorialDistances[1]-25,tutorialDistances[0]-50);
  }
  /*else if(isNew==3){
  }*/
  else{toMakeAlerts.clearRect(0,0,screen.availWidth,screen.availHeight);document.body.removeChild(canvas);}
}

  if(isNew){
    isNew=0;
    canvas=document.createElement("canvas");
    canvas.style.position="absolute";
    canvas.width=screen.availWidth;
    canvas.height=screen.availHeight;
    canvas.style.top="0px";
    canvas.style.left="0px";
    toMakeAlerts=canvas.getContext("2d");
    document.addEventListener("onresize",()=>{try{
      canvas.width=screen.availWidth;
      canvas.height=screen.availHeight;
      doApplicableDrawing();
      }catch(err){}
    });
    canvas.onclick = ()=>{
      isNew++;
      doApplicableDrawing();
    };
    doApplicableDrawing();
    document.body.appendChild(canvas);
  }}

function setupWithArray(stringThing,isArray=false,doDrawing=true) {
  camera.position.x-=x-checkpoint[1]*blockWidth;
  camera.position.y+=y-checkpoint[0]*blockHeight;
  controls.target.x-=x-checkpoint[1]*blockWidth;
  controls.target.y+=y-checkpoint[0]*blockHeight;
  gottenCoins=[];
  document.getElementById("numCoins").innerText=0;
	if(!isArray){let standin = dataToArray(stringThing);if(standin.length==blocksTall&&standin[blocksTall-1].length==blocksWide){currentLevel=standin;}else{alert("Incorrect level dimensions.")}}
	x = blockWidth*checkpoint[1];
	y = blockHeight*checkpoint[0];
  yVel=0;
  xVel=0;
	updateLocations();
  placeBlocks(currentLevel);
  textCtx.clearRect(0,0,screenWidth,screenHeight);
  makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
textCtx.fillStyle="#000000"
    textCtx.font="40px Georgia";
textCtx.fillText("Press 'R' to start.",100,210);
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

function updateLocations() {
	xBlock = Math.floor(x / blockWidth);
	yBlock = Math.floor(y / blockHeight);
}
document.addEventListener('keydown', getPresses, false);
document.addEventListener('keyup', getUps, false);
var isOnBlock;
function moveSomething() {
	//adjacents=[currentLevel[]]
  let startx=x;
  let starty=y;
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
		textCtx.font = '100px Verdana';
		var gradient = textCtx.createLinearGradient(0, 0, 0,100);
		gradient.addColorStop('0', 'black');
		gradient.addColorStop('0.5', 'blue');
		gradient.addColorStop('1.0', 'red');
 makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
		textCtx.fillStyle =gradient;
		textCtx.fillText('You lose.', 0, 100);
    textCtx.font="40px Georgia";
textCtx.fillText("Press 'R' to restart.",100,210);
		return;
	}
	if (yBlock <= 0 || y + yVel <= 0||currentLevel[yBlock][xBlock] == 4 ||
		currentLevel[yBlock][getBlock(blockWidth, x + playerWidth)] == 4 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][xBlock] == 4 ||
		currentLevel[getBlock(blockHeight, y + playerHeight)][
			getBlock(blockWidth, x + playerWidth)
		] == 4) {
		clearInterval(doVels);
		textCtx.font = '100px Verdana';
		var gradient = textCtx.createLinearGradient(0, 0, screenWidth, 0);
		gradient.addColorStop('0', 'magenta');
		gradient.addColorStop('0.25', 'blue');
		gradient.addColorStop('0.5', 'red');
		gradient.addColorStop('0.75', 'orange');
		gradient.addColorStop('1.0', 'yellow');
 makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
		textCtx.fillStyle = "rgb(0,0,0)";
		textCtx.fillText('You win!', 0, 100);
    checkpoint=[blocksTall/2,blocksWide/2];
    textCtx.font="40px Georgia";
textCtx.fillText("Press 'R' to restart.",100,210);
//setupWithArray();

		return;
	}
  possibleCoins=[[yBlock,xBlock],[yBlock,getBlock(blockWidth,x+playerWidth)],[getBlock(blockHeight,y+playerHeight),xBlock],[getBlock(blockHeight,y+playerHeight),getBlock(blockWidth,x+playerWidth)]];
  for(i in possibleCoins){
    e=possibleCoins[i];
    if(currentLevel[e[0]][e[1]]==7&&!has(gottenCoins,e)){
      scene.getObjectByName(e[0]+","+e[1]).material.opacity=0.0;
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
		(getBlock(blockWidth,x+xVel+playerWidth) >= blocksWide||
			currentLevel[yBlock][getBlock(blockWidth, x + playerWidth + xVel)] == 1 ||
			currentLevel[getBlock(blockHeight, y + playerHeight)][
				getBlock(blockWidth, x + playerWidth + xVel)
			] == 1) &&
		xVel > 0
	) {
		x =
			getBlock(blockWidth, x + playerWidth + xVel) * blockWidth -
			playerWidth -
			1;
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
  camera.position.y-=y-starty;
  camera.position.x+=x-startx;
  controls.target.y-=y-starty;
  controls.target.x+=x-startx;
}
function isTyping(){
  allThings=[0];
  try{
  allThings.push(document.activeElement==document.f.name);
  }catch{}
  try{allThings.push(document.activeElement==document.f.code);}catch{}
  return allThings.reduce((total,newThing)=>total+newThing)>0;
}
function getPresses(event) {
  if(!isTyping()){
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
}
function getUps(event) {
  if(!isTyping()){
	if (event.key == 'ArrowRight'||event.key.toLowerCase()=='d') {
		right = false;
	} else if (event.key == 'ArrowLeft'||event.key.toLowerCase()=='a') {
		left = false;
	} else if (event.key == 'ArrowUp' || event.key == ' '||event.key.toLowerCase()=='w') {
		up = false;
	} else if (event.key == 'ArrowDown'||event.key.toLowerCase()=='s') {
		down = false;
	}
}}


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
doVels=false;
setupWithArray(currentLevel,isArray=true);
  }
  else{doVels = setInterval(() => {
	moveSomething();
}, 50);
animate();textCtx.clearRect(0,0,toDrawText.width,toDrawText.height);}
}/*

function toggleGame(){
  doVels=!doVels;
  if(doVels){animate();}
}*/

var renderer = new THREE.WebGLRenderer({canvas:document.getElementById("tutorial")});
//renderer.domElement=document.getElementById("game");
renderer.setSize( width,height );
//document.querySelector("#levelContainer").appendChild( renderer.domElement );
var toDrawText=document.getElementById("overlaid");
function updateDraw(){
toDrawText.style.top=document.getElementById("tutorial").offsetTop;
toDrawText.style.left=document.getElementById("tutorial").offsetLeft;}
updateDraw();
textCtx=toDrawText.getContext("2d")
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 45, width/height, 1, 2000 );

var controls = new THREE.OrbitControls( camera,document.getElementById("levelContainer"));
//controls.enable=true;
controls.enableKeys=false;
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 200, 400 );
controls.update();

const pointLight =
  new THREE.PointLight(0xCCCCCC);

const hemisphereLight=new THREE.HemisphereLight(0xCCCCCC,0x333333,1);

scene.background=new THREE.Color(0xCCCCCC);
// set its position

pointLight.position.x = 10;
pointLight.position.y = 100;
pointLight.position.z = 130;
pointLight.castShadow=true;

hemisphereLight.position.set(0,100,0).normalize();
scene.add(hemisphereLight);

// add to the scene
//scene.add(pointLight);

// Set up the sphere vars
const RADIUS = 4;
const SEGMENTS = 16;
const RINGS = 16;

var sphereMaterial=new THREE.MeshLambertMaterial({color:0xCC0000});

// Create a new mesh with
// sphere geometry - we will cover
// the sphereMaterial next!
const sphere = new THREE.Mesh(

  new THREE.SphereGeometry(
    RADIUS,
    SEGMENTS,
    RINGS),

  sphereMaterial);

// Move the Sphere back in Z so we
// can see it.
sphere.position.z = 1;

// Finally, add the sphere to the scene.
scene.add(sphere);

const secondSphere=new THREE.Mesh(new THREE.SphereGeometry(200,SEGMENTS,RINGS),new THREE.MeshLambertMaterial({color:0x00CCCC}));
secondSphere.position.z=-600;
secondSphere.receiveShadow=true;
//scene.add(secondSphere);


function makeRect(color, size) {
		
			textCtx.fillStyle = color;
		textCtx.fillRect(size[0], size[1], size[2], size[3]);
	}

function setLevel(){
  camera.position.x+=x-checkpoint[1]*blockWidth;
  camera.position.y-=y-checkpoint[0]*blockHeight;
  totalSimulated=0;
  currentLevel = [];
	for (g = 0; g < blocksTall; g++) {
		currentLevel.push([]);
		for (u = 0; u < blocksWide; u++) {
			if (Math.floor(Math.random() * 4) == 1) {
				currentLevel[g].push(1);
			} else if (Math.floor(Math.random() * 15) == 1) {
				currentLevel[g].push(2);
			} else if (Math.floor(Math.random() * 15) == 1) {
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
  for(m=0;m<50;m++){
    runCavingCycle();
  }
  placeBlocks();
  renderer.render(scene,camera)
  makeRect("rgba(255,255,255,0.8)",[0,150,500,100])
  textCtx.fillStyle="#000000"
    textCtx.font="40px Georgia";
textCtx.fillText("Press 'R' to start.",100,210);
}
function placeBlocks(array){
  for(k=0;k<50;k++){
    for(b=0;b<50;b++){
      let toDelete=scene.getObjectByName(k+","+b);
      scene.remove(toDelete);
    }
  }
  if(colors.startsWith("#")||colors.startsWith("r")){correspondingColors[1]=colors};
  for(i in array){
    e=array[i];
    for(a in e){
      if(e[a]!=0){
        o=e[a];
        let lambert=new THREE.MeshLambertMaterial({color:correspondingColors[o]});
        lambert.opacity=correspondingOpacities[o];
        lambert.transparent=!Boolean(parseInt(correspondingOpacities[o]));
        let newBlock=new THREE.Mesh(new THREE.CubeGeometry(blockLength,blockWidth,blockHeight),lambert);
        newBlock.position.set(blockWidth*(a-blocksWide/2),-blockHeight*(i-blocksTall/2),0);
        newBlock.name=i+","+a;
        newBlock.receiveShadow=true;
        scene.add(newBlock);
      }
    }
  }
}

function animate() {
	if(doVels){requestAnimationFrame( animate );}

  sphere.position.set(x-250,-y+250,z);
	// required if controls.enableDamping or controls.autoRotate are set to true
	//controls.update();

	renderer.render( scene, camera );

}
//animate();
//toggleGame();
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
  renderer.render(scene,camera);
});

socket.on('not_exist', () => {
	alert('That level does not exist.');
});


function count(item, array) {
  return [0].concat(array).reduce((total, nelevelPaddingt) => {
    if (nelevelPaddingt == item) {
      return total + 1;
    }
    else {
      return total;
    }
  })
};
levelPadding=1;
function runCavingCycle() {
  
  let newLevel = currentLevel;
  let newRow = [[levelPadding].concat(currentLevel[0].map(i => levelPadding)).concat([levelPadding])];
  let oldLevel = newRow.concat(currentLevel.map(m => [levelPadding].concat(m).concat([levelPadding]))).concat(newRow);
  for (i=0;i<newLevel.length;i++) {
    for (e=0;e<newLevel[i].length;e++) {
      let thisNum = oldLevel[i+1][e+1];
      let adjacents = [oldLevel[i][e+1], oldLevel[i+1][e + 2], oldLevel[i + 2][e+1], oldLevel[i][e+1]];
      let neighbors=[oldLevel[i][e],oldLevel[i][e+1],oldLevel[i][e+2],oldLevel[i+1][e],oldLevel[i+1][e+2],oldLevel[i+2][e],oldLevel[i+2][e+1],oldLevel[i+2][e+2]]
      let total = {
        stones: count(1, neighbors),
        lava: count(3, neighbors),
        water: count(2, neighbors),
        coins: count(7, neighbors),
        air:count(0,neighbors)
      };
      //Air
      if (thisNum == 0) {
        if (total.stones >= 5) {
          newLevel[i][e] = 1;
        }
        else if (adjacents[0] == 3) {
          newLevel[i][e]=3;
        }
        else if (adjacents[0] == 2) {
          newLevel[i][e]=2;
        }
      }
      //Stone
      else if (thisNum == 1) {
        if (total.air>5) {
          newLevel[i][e] = 0;
        }
        else if (adjacents[2] == 3&&oldLevel[i+3][e+1]==1&&oldLevel[i+2][e]==1&&oldLevel[i+2][e+2]==1) {
          newLevel[i][e] = 3;
        }
        else if (total.lava >= 6) {
          newLevel[i][e] = 3;
        }
      }
      //Water
      else if(thisNum==2){
        if(count(3,adjacents)>0){
          newLevel[i][e]=1;
        }
        else if (adjacents[2] == 0&&count(1,adjacents)<=2) {
          newLevel[i][e] = 0;
        }
        else if(adjacents[2]==2&&count(1,adjacents)<=2){
          newLevel[i][e]=0;
        }
      }
      //Lava
      else if (thisNum == 3) {
        if (count(2,adjacents) >0) {
          newLevel[i][e] = 1;
        }
        else if (adjacents[2] == 0&&count(1,adjacents)<=2) {
          newLevel[i][e] = 0;
        }
        else if(count(1,adjacents)==4){
          newLevel[i][e]=1;
        }
        else if(adjacents[2]==3&&count(1,adjacents)<=2){
          newLevel[i][e]=0;
        }
      }
      //Coins
    }
  }
  currentLevel = newLevel;
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
}
function doCycles(numCycles){
  for(i=0;i<numCycles;i++){
    runCavingCycle();
    placeBlocks();
  }
}
function addPyramid(){
  let stalactite=new THREE.CylinderGeometry(0,20,1000,4)
  let finalPyramid=new THREE.Mesh(stalactite,new THREE.MeshLambertMaterial({color:0x888888}));
  scene.add(finalPyramid);
}