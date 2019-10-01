const URLReader = new URLSearchParams(window.location.search);
const DEBUG = false; {
  let fallback = console.log.bind(console);
  console.log = function() {
    if (DEBUG) fallback.apply(console, arguments)
  }
}


function chooseElement(probabilities) {
  let currVal = probabilities.def;
  for (i = 0; i < 50; i++) {
    if (currVal == probabilities.def && Math.random() <= probabilities.allProbs[i]) {
      currVal = i;
    }
  }
  return currVal;
}

var platformerFactory = function(list, renderSpot /*renderSpot is either an empty container or an object of two premade canvas elements, 3 and 2*/ , levelData) {

  var levelArr;
  var ret = {};
  var states = {};
  var checkpoint = [];
  var renderContexts = {
    3: {
      canvas: undefined,
      context: undefined
    },
    2: {
      canvas: undefined,
      context: undefined
    }
  };
  var blockColor;
  var dims = {
    x: {
      totalBlocks: 50,
      blockSize: 10,
      playerSize: 8,
      padding: 1,
      vel: 0
    },
    y: {
      vel: 0
    },
    z: {
      vel: 0
    }
  }; //Each dimension has a totalBlocks, a blockSize, a playerSize, a playerPosition, a maxVel, a startPosition, a padding when spawning and a velocity.
  var physicsInterval = null;
  var blockData = []; //Blocks that change every restart of the game, each has an id and a function to run - see below in the if statement
  var flat = false; //2D or 3D (only affects rendering)


  ret.changeOpacity = function(coords, opacity) {
    if (opacity < 1 && opacity > 0 && opacity instanceof float && coords.hasOwnProperty("x") && coords.hasOwnProperty("y")) {
      states[coords.y][coords.x].opacity = opacity;
    }
  }

  ret.updateLevel = function(newLevel) {
    if (newLevel instanceof String) {
      newLevel = ret.deserialize(newLevel);
    } else if (!(newLevel instanceof Array)) {
      throw new TypeError("Level must be a level string or a level array.");
    }
    newDims = getDims(newLevel);
    dims.x.totalBlocks = newDims[1];
    dims.y.totalBlocks = newDims[2];
    dims.z.totalBlocks = newDims[0];
    levelArr = newLevel;
    //Restart game:

  }

  ret.end = function(str) { //str is a value to display when the game is over
    if (physicsInterval) {
      clearInterval(physicsInterval);
      physicsInterval = null;
      teleport(checkpoint);
      if (str) {
        notificationText(str);
      }
    }
  }

  ret.start = function() {
    if (physicsInterval) {
      ret.end()
    }
    physicsInterval = setInterval(physicsCycle, 50);
  }

  ret.serialize = function(arr) {
    if (!arr) {
      arr = levelArr;
    }
    return arr.map(i => {
      return i.join("")
    }).join(",");
  }
  ret.deserialize = function(str) { //Also, do dimension testing
    if (str) {
      return arr.map(i => {
        return i.split("")
      }).split(",");
    } else {
      return levelArr;
    }
  }

  ret.initPlatformer = function(l, rs, ld) {
    if (ld) {
      if (ld.hasOwnProperty("x")) {
        dims.x = ld.x;
      }
      if (ld.hasOwnProperty("y")) {
        dims.y = ld.y;
      }
      if (ld.hasOwnProperty("z")) {
        dims.z = ld.z;
      }
      if (ld.hasOwnProperty('blockData')) {
        blockData = ld.blockData;
      } else {
        blockData = {
          7: {
            name: "Coin",
            onReset: (states, lvlArr, methods, dims) => {
              //Iterate through the loop, reset all coins with an opacity of 0 to existing
            },
            onPhysics: (states, lvlArr, methods, dims) => {

            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          1: {
            name: "Stone",
            onPhysics: (states, lvlArr, methods, dims) => {
              //Do collision with player

            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          0: {
            name: "Air",
            onPhysics: (states, lvlArr, methods, dims) => {
              //Nothing
            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          2: {
            name: "Water",
            onPhysics: (states, lvlArr, methods, dims) => {
              //Let the player swim
            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          3: {
            name: "Lava",
            onPhysics: (states, lvlArr, methods, dims) => {
              let closeBlocks = {
                ul: getBlock(getMods({
                  x: {
                    fullSize: dims.x.playerPosition,
                    unitSize: dims.x.blockSize
                  },
                  y: {
                    fullSize: dims.y.playerPosition,
                    unitSize: dims.y.blockSize
                  }
                })),
                ur: getBlock(getMods({
                  x: {
                    fullSize: dims.x.playerPosition + dims.x.playerSize,
                    unitSize: dims.x.blockSize
                  },
                  y: {
                    fullSize: dims.y.playerPosition,
                    unitSize: dims.y.blockSize
                  }
                })),
                dr: getBlock(getMods({
                  x: {
                    fullSize: dims.x.playerPosition + dims.x.playerSize,
                    unitSize: dims.x.blockSize
                  },
                  y: {
                    fullSize: dims.y.playerPosition,
                    unitSize: dims.y.blockSize
                  }
                })),
                dl: getBlock(getMods({
                  x: {
                    fullSize: dims.x.playerPosition,
                    unitSize: dims.x.blockSize
                  },
                  y: {
                    fullSize: dims.y.playerPosition + dims.y.playerSize,
                    unitSize: dims.y.blockSize
                  }
                }))
              }
              if (Object.values(closeBlocks).includes(3)) {
                methods.end("You lose! Click to restart.")
              }
            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          4: {
            name: "Win",
            onPhysics: (states, lvlArr, methods, dims) => {
              let closeBlocks = getCollisions(lvlArr);
              //Make them win
              if (Object.values(closeBlocks).includes(4)) {
                methods.end("You win! Click to restart.");
              }
            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          5: {
            name: "Trampoline",
            onPhysics: (states, lvlArr, methods) => {
              //Make the player jump if touching a trampoline
            },
            defaultColor: "rgb(,,)",
            defaultOpacity: 1.0
          },
          6: {
            name: "Checkpoint",
            onPhysics: (states, lvlArr, methods, dims) => {
              //Set checkpoints
            }
          }
        }
      }
    }
    if (ld.hasOwnProperty("isFlat") && ld.isFlat) {
      flat = true;
    }
  }
  if (rs) {
    for (i = 2; i < 4; i++) {
      if (rs.hasOwnProperty(i)) {
        let thisDimInfo = rs[i]; //This is an object, to allow for potential future usage of both context and element, or extra settings
        if (thisDimInfo.hasOwnProperty("canvas") && thisDimInfo.canvas instanceof HTMLElement) {
          renderContexts[i].canvas = thisDimInfo.canvas;
          renderContexts[i].context = thisDimInfo.canvas.getContext({
            3: "webgl",
            2: "2d"
          } [i]); //Not necessary for threeJS, just for fun
        }
      }
    }
  }}
  checkpoint = []
}

ret.setRender = function(do3D, headless) {
  if (do3D) {
    ret.render = render3D;
  } else {
    ret.render = render2D;
  }
  if (headless) {
    ret.render = () => { /*Do nothing; headless mode does not include rendering*/ }
  }
}

function animate() {
  if (physicsInterval) {
    requestAnimationFrame(animate);
  }

  ret.render();

}

function render3D() {
  if (isSetup) {
    renderContexts[3].objects.player.position.set(x - 250, -y + 250, z);
    renderer.render(scene, camera);
  } else {
    throw ValueError("Undefined context for 3D platformer");
  }
}

function getCollisions() {
  return {
    ul: getBlock(getMods({
      x: {
        fullSize: dims.x.playerPosition,
        unitSize: dims.x.blockSize
      },
      y: {
        fullSize: dims.y.playerPosition,
        unitSize: dims.y.blockSize
      }
    })),
    ur: getBlock(getMods({
      x: {
        fullSize: dims.x.playerPosition + dims.x.playerSize,
        unitSize: dims.x.blockSize
      },
      y: {
        fullSize: dims.y.playerPosition,
        unitSize: dims.y.blockSize
      }
    })),
    dr: getBlock(getMods({
      x: {
        fullSize: dims.x.playerPosition + dims.x.playerSize,
        unitSize: dims.x.blockSize
      },
      y: {
        fullSize: dims.y.playerPosition,
        unitSize: dims.y.blockSize
      }
    })),
    dl: getBlock(getMods({
      x: {
        fullSize: dims.x.playerPosition,
        unitSize: dims.x.blockSize
      },
      y: {
        fullSize: dims.y.playerPosition + dims.y.playerSize,
        unitSize: dims.y.blockSize
      }
    }))
  }

}

function getBlock(indices, list) {
  listDims = getDims(list);
  if (indices.x >= listDims[1] || indices.y >= listDims[0] || indices.x <= 0) {
    return 3; //Lava, so that if the player touches, they die
  } else if (indices.y <= 0) {
    return 4;
  } else {
    return list[indices.y][indices.x]; //Otherwise normal block
  }
}

function render2D() {
  if (isSetup) {
    let count1 = -1;
    let count2 = -1;
    let screenDims = {
      x: renderContexts[2].canvas.width,
      y: renderContexts[2].canvas.height
    };
    let levelDims = {
      x: dims.x.totalBlocks * dims.x.blockSize,
      y: dims.y.totalBlocks * dims.y.blockSize
    };
    renderContexts[2].context.fillStyle = 'rgb(0,0,0)';
    renderContexts[2].context.fillRect(0, 0, screenDims.x, screenDims.y);
    for (
      i = yBlock - Math.floor(dims.y.totalBlocks / 2) - 1; i < yBlock + Math.floor(dims.y.totalBlocks / 2) + 1; i++
    ) {
      count1++;
      count2 = -1;
      for (
        e = xBlock - Math.floor(dims.x.totalBlocks / 2) - 1; e < xBlock + Math.floor(dims.x.totalBlocks / 2) + 1; e++
      ) {
        count2++;
        if (i >= 0 && i < dims.y.totalBlocks && e >= 0 && e < dims.x.totalBlocks) {
          if (blockData[levelArr[i][e]]) {
            let theData = blockData[levelArr[i][e]];
            if (theData.hasOwnProperty("render")) {
              theData.render(levelArr, states, false); //Setup later
            } else if (theData.hasOwnProperty("color")) {

            }
          } else {
            renderContexts[2].context.fillStyle = 'rgb(150,150,150)';
          }
        }
      }
      renderContexts[2].context.fillRect(screenDims.x / 2, screenDims.y / 2, dims.x.playerSize, dims.y.playerSize);

    }
  } else {
    throw ValueError("Undefined context for 2D platformer--Headless mode is not yet supported");
  }
}

function getDims(arr) { //Takes in a matrix, just for speed - Can be converted to a 3D tensor
  allDims = [1]; //Starts with a z-dimension of 1
  if (arr instanceof Array) {
    allDims.push(arr.length);
    for (i in arr) {
      if (allDims.length < 2) allDims.push(arr[i].length)
      if (arr[i].length != allDims[2]) {
        throw ValueError("Irregular matrix dimensions.");
      }
    }
  } else {
    throw TypeError("Argument must be an Array.");
  }
} //Todo: convert to an actual Array method


function makeRandom(probabilities, dimensions) {
  if (probabilities) {
    let allPossibilities = Object.keys(probabilities);
    let newArr = Array(dimensions.y).fill(0).map(i => {
      return Array(dimensions.x).fill(0).map(i => {
        return chooseElement(probabilities);
      })
    });
    return newArr;
  } else {
    //Run defaults
    return ret.makeRandom({
      def: 0,
      allProbs: [0, 0.25, 1 / 9, 1 / 15]
    }, {
      x: 50,
      y: 50
    });
  }
}

function physicsCycle() {
  //Do physics stuff
  Object.values(blockData).map(i => {
    (i.onPhysics | function() {})();
  })
}

function getMods(blocksToGet) {
  if (blocksToGet instanceof Object) {
    let toReturn = {
      error: []
    };
    let allBlockNames = Object.keys(blocksToGet);
    for (i in allBlockNames) {
      if (blocksToGet.allBlockNames[i] instanceof Object && blocksToGet.allBlockNames[i].hasOwnProperty("fullSize") && blocksToGet.allBlockNames[i].hasOwnProperty("unitSize")) {
        toReturn.allBlockNames[i] = Math.floor(blocksToGet.allBlockNames[i].fullSize / blocksToGet.allBlocksNames[i].unitSize);
      } else {
        toReturn.error.push(new ValueError("Error when calculating block of " + allBlockNames[i] + ": Each dimension query must be of shape {fullSize:____, unitSize:_____} where both fullSize and unitSize are integers"))
      }
    }
    return toReturn;
  }
  throw new ValueError("Error: Object must be of shape {xBlock: {fullSize:dims.x.playerPosition,unitSize:dims.x.blockSize},yBlock:...}")

}

function resetLevel() {
  // Reset coins and other temp things
  blockData.map(i => {
    i.onReset(states, levelArr, ret)
  });
}

function runMapGen(numCycles, mapGenName, toRun) {
  if (mapGenName) {
    //For a custom mapgen--later
    return toRun;
  } else {
    for (i = 0; i < numCycles; i++) {
      toRun = runCavingCycle(toRun);
    }
    return toRun;
  }
}

function teleport(location, isBlocks) {
  locs = Object.keys(location);
  for (i in locs) {
    if (location.hasOwnProperty(locs[i])) {
      dims[locs[i]].position = (isBlocks ? location[locs[i]] * dims[locs[i]].blockHeight : location[locs[i]])
    }
  }
  //Do optional 3D stuff, if the user has selected 3D mode
}
ret.initPlatformer(list, renderSpot, levelData);
ret.setRender(false);
ret.start();
return ret;
}
// console.log(getDims([[0, 0, 0], [0, 0, 0]]))
}
/*Todo:
- Rewrite code, make it nice
- Allow 2D, 3D rendering - In 2D, just don't use threjs and use the 2D canvas to draw it all
*/