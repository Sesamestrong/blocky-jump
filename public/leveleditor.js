const width = 50, height = 50;
const urlParams = new URLSearchParams(window.location.search);
const iconPath = "/icons";

const DEBUG = false;

let realLog = console.log.bind(console);
console.log = function(){
  if(DEBUG) realLog.apply(console, arguments)
}

function genArr(){
  let currentLevel = [];
  for (g = 0; g < height; g++) {
    currentLevel.push([]);
    for (u = 0; u < width; u++) {
      if (Math.floor(Math.random() * 4) == 1) {
        currentLevel[g].push(1);
      } else if (Math.floor(Math.random() * 9) == 1) {
        currentLevel[g].push(2);
      } else if (Math.floor(Math.random() * 15) == 1) {
        currentLevel[g].push(3);
      } else if (Math.floor(Math.random()*50)==1){
        currentLevel[g].push(7);
      } else {
        currentLevel[g].push(0);
      }
    }
  }
  currentLevel[Math.floor(width / 2)][Math.floor(height / 2)] = 0;
  currentLevel[Math.floor(width / 2)][Math.floor(height / 2) + 1] = 0;
  currentLevel[Math.floor(width / 2)][Math.floor(height / 2) - 1] = 0;
  currentLevel[Math.floor(width / 2) - 1][Math.floor(height / 2)] = 0;
  currentLevel[Math.floor(width / 2) - 1][
    Math.floor(height / 2) + 1
  ] = 0;
  currentLevel[Math.floor(width / 2) - 1][
    Math.floor(height / 2) - 1
  ] = 0;
  currentLevel[Math.floor(width / 2) + 1][Math.floor(height / 2)] = 1;
  currentLevel[Math.floor(width / 2) + 1][
    Math.floor(height / 2) + 1
  ] = 1;
  currentLevel[Math.floor(width / 2) + 1][
    Math.floor(height / 2) - 1
  ] = 1; //clear the area around the player, give them a place to stand
  return currentLevel;
}
function lerp(s, e, t) {
    return s + t * (e-s);
}
function lerpP(a, b, t){
  return {x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)};
}
function diagDist(a, b){
  x = a.x-b.x, y = a.y-b.y;
  return Math.max(Math.abs(x), Math.abs(y))+1;
  // return 100;
}
function buildArray(n, f){
  return Array(n).fill().map(f);
}
function roundP(p){
  return {x: Math.round(p.x), y: Math.round(p.y)}
}
function flatten(arr){
  return arr.reduce(function(a, b) {
    return a.concat(b);
  }, []);
}
function bfsFill(start, arr){
  const adjacent = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const type = arr[start.x][start.y];

  //console.log(type)

  let all = [start];
  let index = 0;
  let visited = arr.map(e=>e.map(i=>false));

  let next = all[index];
  while(index < all.length){
    all = all.concat(adjacent.filter(function(e){
      let x = next.x+e[0], y = next.y+e[1];
      if(x < 0 || x >= arr.length || y < 0 || y >= arr[0].length) return false;
      return arr[x][y] === type && !visited[x][y];
    }).map(function(e){
      let x = next.x+e[0], y = next.y+e[1];
      visited[x][y] = true;
      return {x:x, y:y};
    }));
    index++;
    next = all[index];
  };
  return all;
}
function defaults(obj, defaults){
  Object.keys(obj).forEach(e=>defaults[e]=obj[e]);
  return defaults;
}
function choose(p, d, rand){
  var o = Object.keys(p);
  // var total = o.reduce((a, b) => a+b);
  var total = 100;
  var val = rand(total), acc=0;
  //console.log(val);
  for(var i in o){
    if(acc <= val && val < p[o[i]]+acc){
      return o[i];
    } else {
      acc+=p[o[i]];
    }
  }
  return d;
}
function $(e){
  return ((e instanceof HTMLElement)?e:(typeof e === "string"? document.querySelector(e):null));
}

function RNG(seed, c){
  c = c||{};
  this.current = seed||(new Date).getTime();
  this.mod = c.mod||Math.pow(2, 90);
  this.mul = c.mul||25214903917 ;
  this.inc = c.inc||11;

  this.seed = function(seed){
    this.current = seed||(new Date).getTime();
  }
  this.rand = function(){
    this.current = (this.inc + this.current * this.mul) % this.mod;
    return this.current/(this.mod+1);
  }
  this.between = function(f, t){
    f = f||1;
    t = t||0;
    return this.rand()*(f-t)+t;
  }
}

let sortableList = (function(l){
  var USPEED = 100;
  var elements = l||[];
  var list = document.getElementById("list");
  var lastQuery = "";
  var ret = {};

  ret.renderList = function(l, q){
    if(l.length > 0){
      var g = document.createDocumentFragment();
      for(var i = 0; i < l.length; i++){
        var j = document.createElement('div');
        j.classList.add('list-item')
        j.innerText = l[i];
        let asdf = l[i];
        j.onclick = function(){
          editor.setName(encodeURIComponent(asdf))
          $('#select-modal-container').classList.add('hidden');
          $("#import-modal-container").classList.add('hidden');
          editor.onget(editor.getName());
        };
        g.appendChild(j);
      }
      list.innerHTML = "";
      list.appendChild(g);
    } else {
      list.innerHTML = "<p class='no-results'>No results found for '"+q+"'<p>";
    }
  }
  ret.sort = function(query){
    // console.log(query)
    if(query) ret.renderList(elements.filter(function(e){
      return e.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    }).sort(function(a, b){
      return a.toLowerCase().indexOf(query.toLowerCase())-b.toLowerCase().indexOf(query.toLowerCase());
    }), query);
    else ret.renderList(elements, query);
  }
  ret.render = function(){
    if(r){
      ret.sort(document.getElementById("search").value);
      r = false;
    }
  }
  ret.update = function(newL){
    elements = newL;
    ret.renderList(newL);
  }

  var r = true;
  // /*
  window.setInterval(ret.render, USPEED)
  document.getElementById('search').addEventListener('keydown', function(e){
    r = true
  });
  ret.renderList('');
  return ret;
})([]);
let paintbrush = function (el) {
  el = $(el);
  let _$ = $.bind(el);
  let config = {
    color: '#000',
  };
  let ret = {
    color: function (value) {
      config.color = value;
      return this;
    },
    point: function (v) {
      _$('#i-'+v.x+'-'+v.y).style.backgroundColor = config.color;
    },
    line: function (v1, v2, antialias) {
      if(antialias === undefined) antialias = true;
      let slope = y/x;
      let h = (slope==1)?0:(slope>1?1:-1);

      let total = Math.ceil(diagDist(v1, v2)*1.5);
      let currentArr = [];
      let coords = buildArray(total, (el, i)=>roundP(lerpP(v1, v2, i/total)))

      if(antitalias) coords = coords.filter(function(item, index, arr){
        if((index == arr.length-1)||(index == 0)) {
          currentArr.push(true);
          return true;
        }
        if(currentArr[index-1]&&((arr[index-1].y == item.y && arr[index+1].x == item.x)||(arr[index-1].x == item.x && arr[index+1].y == item.y))){
              currentArr.push(false);
              return false;
        }
        currentArr.push(true);
        return true;
      });

      coords.forEach(i=>_$('#i-'+i.x+'-'+i.y).style.backgroundColor = config.color);
      return coords;
    },
    rect: function (v1, v2, filled) {
      let coords = []
      if(filled){
        let height = Math.abs(v2.y-v1.y)+1, width = Math.abs(v2.x-v1.x)+1;
        var signy = Math.sign(v2.y-v1.y), signx = Math.sign(v2.x-v1.x);
        let coords = flatten(buildArray(height, (el, iy)=>flatten(buildArray(width, (el, ix)=>({
          x:v1.x+ix*signx,
          y:v1.y+iy*signy,
        })))));
      } else {
        let smallx = Math.min(v2.x, v1.x), smally = Math.min(v2.y, v1.y);
        coords = [
          buildArray(Math.abs(v2.x-v1.x)+1, (el, i)=>({x:i+smallx, y:v2.y})),
          buildArray(Math.abs(v2.x-v1.x)+1, (el, i)=>({x:i+smallx, y:v1.y})),
          buildArray(Math.abs(v2.y-v1.y)+1, (el, i)=>({y:i+smally, x:v2.x})),
          buildArray(Math.abs(v2.y-v1.y)+1, (el, i)=>({y:i+smally, x:v1.x})),
          // [{x: x, y: y}]
        ].reduce((a, b)=>a.concat(b));
      }
      coords.forEach(i=>_$('#i-'+i.x+'-'+i.y).style.backgroundColor = config.color);
      return coords;
    }
  };
  return ret;
}
let editor = (function(){
  let blockList = [];

  function BlockButton(block, c){
    c = c||{}
    let b = document.createElement('button');
    b.classList.add('block-button');
    b.style.backgroundColor = blocks[block].color
    b.addEventListener('click', function(){
      ret.changeBlock(block);
      $("#current-block").style.backgroundColor = ret.getBlock(block).color;
      blockButton.classList.add('hidden');
    });
    b.addEventListener('mouseenter', function (e) {
      e.target.style.backgroundColor = blocks[block].hover;
    });
    b.addEventListener('mouseleave', function (e) {
      e.target.style.backgroundColor = blocks[block].color;
    });
    // b.innerText = block;
    b.id = "convert-"+block;
    b.title = c.title||'';
    return b;
  }
  function ToolButton(tool, config){
    let b = document.createElement('button');
    b.classList.add('tool');
    b.style.backgroundImage = "url("+iconPath+"/"+tool+".png)";
    b.addEventListener('click', function(e){
      $('#tool-'+ret.getCurrentTool()).classList.remove('active');
      e.target.classList.add('active');
      ret.changeTool(tool);
    });
    // b.innerText = config.name||tool;
    b.id = "tool-"+tool;
    b.title = config.name||tool;
    return b;
  }
  function CommandButton(command, config){
    let b = document.createElement('button');
    b.classList.add('command');
    b.style.backgroundImage = "url("+iconPath+"/"+command+".png)";
    b.addEventListener('click', function(e){
      ret.execCommand(command);
    });
    // b.innerText = config.name||tool;
    b.id = "command-"+command;
    b.title = config.name||command;
    return b;
  }
  function ContextMenuCommand(command, config){
    let b = document.createElement('div');
    b.classList.add('context-menu-item');
    // b.style.backgroundImage = "url("+iconPath+"/"+command+".png)";
    b.addEventListener('click', function(e){
      config.command.call(ret);
      contextMenu.classList.add('hidden');
    });
    // b.innerHTML = '<img class="tool"></img>'+(config.name||command);
    b.innerHTML = config.name||command;
    // b.children[0].src = iconPath+"/"+command+".png";
    b.id = "context-"+command;
    b.title = config.name||command;
    console.log(b.innerHTML);
    return b;
  }
  function EditorTable(w, h, list){
    let table = document.createElement('table');
    table.classList.add('table');
    for(let i = 0; i < w; i++){
      blockList.push([]);
      let tr = document.createElement("tr");
      for(let j = 0; j < h; j++){
        blockList[i].push(0);
        let td = document.createElement("td");
        td.id = 'i-'+i+"-"+j;
        td.dataset.index = i+"-"+j;
        td.classList.add('table-cell');
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    return table;
  }

  let current = '';
  let tool = '';

  let tools = {};
  let blocks = {};
  let commands = {};

  let types = {};
  let toolState = {};
  let imported = false;
  let levelData = {
    name: '',
    // url: '',
    password: '',
    jumpHeight: 1,
    sideSpeed: 1,
    type: 'custom',
    probabilities: {
      stone: 25,
      lava: 6,
      water: 12,
    },
    color: '#000000',
  }

  let drawStack = [{}];
  let drawIndex = 0;

  let editorContainer = $("#editor");
  let configContainer = $("#editor-left");

  let publishButton = $('#publish-level');
  let levelName = $('#level-name');
  let editPassword = $('#edit-pass');

  let importButton = $('#import-level');
  let importName = $('#import-name');
  let selectLevelButton = $('#select-level');

  let selectButton = $("#select-level");

  let contextMenu = $("#context-menu");

  // let stoneP = $('#config-random-stone');
  // let lavaP = $('#config-random-lava');
  // let waterP = $('#config-random-water');
  //
  // let jumpHeight = $('#config-jump');
  // let sideSpeed = $('#config-speed');
  let ret = {
    set: function(x, y, v){
      v = v===undefined?blocks[current].type:v;
      blockList[x][y] = v;
    },
    getImported: function(){return imported},
    setAll: function(coords, val){
      coords = coords||[];
      coords.forEach(function(i){
        var block = (blocks[val]!==undefined?blocks[val]:blocks[current])
        $('#i-'+i.x+'-'+i.y).style.backgroundColor = block.color;
        ret.set(i.x, i.y, block.type);
      });
    },
    get: function(x, y){
      return blockList[x][y];
    },
    serialize: function(l){
      return (l||blockList).map(e=>e.join("")).join(",");
    },
    deserialize: function(s){
      return s.split(',').map(e=>e.split("").map(i=>~~i));
    },
    getBlocks: function () {
      return blockList;
    },

    display: function(x, y, color){
      var el = $(e2+"-"+i2);
      el.style.backgroundColor=color||blocks[blockList[x][y]].color;
    },
    render: function(b){
      if(ret.editor === false){
        ret.editor = EditorTable(width, height, b);
        editorContainer.appendChild(ret.editor);
      }
      // let coords = 
      if(b !== undefined&&b.length == width) {
        blockList=b;
        blockList.forEach((e, e2)=>e.forEach((i, i2)=>{
          $('#i-'+e2+"-"+i2).style.backgroundColor=types[i].color;
          ret.set(e2, i2, i)
        }));
        imported = JSON.parse(JSON.stringify(b));
      } else {
        blockList.forEach((e, e2)=>e.forEach((i, i2)=>{
          $('#i-'+e2+"-"+i2).style.backgroundColor=types[i].color;
          ret.set(e2, i2, i)
        }));
      }

      // this.state.push('pencil', {coords: blockList});
      ret.updateConfigDom();
    },
    renderBlock: function(x, y){
      $('#i-'+x+"-"+y).style.backgroundColor=blockList[x][y];
    },

    add: function (t, v){
      blocks[t] = (function (v) {
        let d = {color: '#000', type: 0};
        Object.keys(d).forEach(e=>(v[e] === undefined?v[e]=d[e]:true));
        return v;
      })(v);
      types[v.type] = {name: t, color: v.color};
      if(current === "") current = t;
      $("#blocks").appendChild(BlockButton(t));
    },
    changeBlock: function(c){
      if(blocks[c]) current = c;
      if(types[c]) current = types[c].name;
    },
    getBlock: function (t){
      return blocks[t||current];
    },
    getCurrentBlock: function (){
      return current;
    },

    addTool: function(c, config){
      config = defaults(config, {
        render: function (v) {
          ret.setAll(v.coords, v.block);
        },
        create: function(){},
        destroy: function(){},
        click: function(){},
        up: function(){},
        move: function(){},
        down: function(){},
      })
      tools[c] = config;
      if(tool === "") tool = c;
      $("#tools").appendChild(ToolButton(c, config));
      config.create.call(ret);
    },
    changeTool: function(t){
      let pt = tool;
      tool = t;
      tools[tool].create.call(ret, pt);
    },
    getTool: function(t){
      return tools[t||tool];
    },
    getCurrentTool: function(){
      return tool;
    },

    addContextCommand: function (c, config) {
        config = defaults(config, {
          create: function () {},
          command: function () {},
          // click: function(){},
          // up: function(){},
          // move: function(){},
          // down: function(){},
        });
        $("#context-menu").appendChild(ContextMenuCommand(c, config));
        config.create.call(ret);
    },

    addCommand: function(c, config){
      config = defaults(config, {
        create: function () {},
        exec: function(){},
        done: function(){},
        // click: function(){},
        // up: function(){},
        // move: function(){},
        // down: function(){},
      });
      commands[c] = config;
      $("#commands").appendChild(CommandButton(c, config));
      config.create.call(ret);
    },
    execCommand: function(c){
      commands[c].exec.call(ret);
    },

    genRandom: function(seed, p){
      Math.seedrandom(seed);
      newB = genArr();
      if(runCavingCycle !== undefined){
        for(let i = 0; i < 50; i++) {
          newB = runCavingCycle(newB);
        }
      }
      editor.render(newB);
    },

    push: function (g) {
      g.tool = tool;
      g.block = g.block||current;
      drawStack.splice(drawIndex+1, drawStack.length, g);
      drawIndex++;
    },
    undo: function () {
      if(drawIndex-1 < 0) return;
      drawIndex--;
      let actions = [];
      let p;
      let index = drawIndex;
      do {
        p = drawStack[index];
        actions.unshift(p);
        index--;
      } while(index > -1 && p.tool !== 'clear');
      if(!imported){
        ret.clear();
      } else {
        ret.render(imported);
      }
      for(var i in actions){
        let action = actions[i];
        if(action.tool) tools[action.tool].render.call(ret, action);
      }
    },
    redo: function () {
      if(drawIndex+1 >= drawStack.length) return;
      drawIndex++;
      tools[drawStack[drawIndex].tool].render.call(ret, drawStack[drawIndex]);
    },
    getDrawStack: function () {
      return ({stack:drawStack, index: drawIndex});
    },


    clear: function (block) {
      blockList = buildArray(width, e=>buildArray(height, i=>blocks[block||'air'].type));
      blockList.forEach((e, e2)=>e.forEach((i, i2)=>$('#i-'+e2+"-"+i2).style.backgroundColor=blocks[block||'air'].color));
    },
    editor: false,
    state: {
      save: function(val){
        toolState[tool] = val;
      },
      get: function() {
        return toolState[tool];
      }
    },

    // setUrl: function (url) {
    //   levelData.url = url;
    // },
    setName: function (name, url) {
      levelData.name = name;
      // if(url) levelData.url = '/levels/'+encodeURIComponent(name);
    },
    setPass: function (pass) {
      levelData.password = pass;
    },
    setPlatformColor: function (color) {
      levelData.jump = color;
    },
    setGravity: function (jumpHeight) {
      levelData.jumpHeight = jumpHeight;
    },
    setSideSpeed: function (sideSpeed) {
      levelData.sideSpeed = sideSpeed;
    },
    setLevelData: function (obj) {
      levelData = defaults(obj, levelData);
    },

    // getUrl: function () {
    //   return levelData.url;
    // },
    getName: function () {
      return levelData.name;
    },
    getPass: function () {
      return levelData.password;
    },
    getPlatformColor: function () {
      return levelData.jump;
    },
    getGravity: function () {
      return levelData.jumpHeight;
    },
    getSideSpeed: function () {
      return levelData.sideSpeed;
    },
    getLevelData: function () {
      return levelData;
    },

    updateConfigDom: function () {
      var map = {
        probabilities: {
          stone: '#config-random-stone',
          lava: '#config-random-lava',
          water: '#config-random-water',
        },
        color: '#config-color-value',
        jumpHeight: '#config-jump',
        sideSpeed: '#config-speed',
      }
      function mapProps(map, props){
        for(var i in map){
          if(typeof map[i] === 'object'){
            mapProps(map[i], props[i]);
          } else {
            var el = $(map[i]);
            if(props[i]) el.value = props[i];
          }
        }
      }
      mapProps(map, levelData);
    },
    updateConfigValues: function () {
      var map = {
        probabilities: {
          stone: '#config-random-stone',
          lava: '#config-random-lava',
          water: '#config-random-water',
        },
        color: '#config-color-value',
        jumpHeight: '#config-jump',
        sideSpeed: '#config-speed',
      }
      function mapProps(map, props){
        for(var i in map){
          if(typeof map[i] === 'object'){
            mapProps(map[i], props[i]);
          } else {
            var el = $(map[i]);
            if(el.value) props[i] = el.value;
          }
        }
      }
      mapProps(map, levelData);
    },

    onget: function (name) {},
    onsend: function () {},
  }

  let mousedown = false;
  let ctrlkey = false;
  let mousestart = {x:0, y:0};

  function onclick(e){
    var d = e.target.dataset;
    if(d.index !== undefined){
      var coords = d.index.split('-').map(e=>~~e);
      (ret.getTool().click||function(){}).call(ret, coords[0], coords[1], e);
      return false;
    }
  }
  function onmousedown(e){
    if(e.target.closest('#context-menu')){
      return;
    } else if(!contextMenu.classList.contains('hidden')) {
      contextMenu.classList.add('hidden');
      e.stopPropagation();
      e.preventDefault();
      return false;
    } else {
      var d = e.target.dataset;
      if(e.which === 1 && d.index !== undefined){
        mousedown = true;
        var coords = d.index.split('-').map(e=>~~e);
        mousestart = {x: coords[0], y:coords[1]};
        (ret.getTool().down||function(){}).call(ret, coords[0], coords[1], e);
        return false;
      }
      return false;
    }
  }
  function onmouseup(e){
    if(e.target.closest('#context-menu')){
      return;
    } else {
      mousedown = false;
      var d = e.target.dataset;
      if(e.which === 1 && d.index !== undefined){
        mousestart = undefined;
        var coords = d.index.split('-').map(e=>~~e);
        (ret.getTool().up||function(){}).call(ret, coords[0], coords[1], mousestart, e);
        return false;
      }
    }
  }
  function onmousemove(e){
    if(e.target.closest('#context-menu')){
      return;
    } else {
      var d = e.target.dataset;
      if(e.which === 1 && d.index !== undefined){
        var coords = d.index.split('-').map(e=>~~e);
        (ret.getTool().move||function(){}).call(ret, coords[0], coords[1], mousedown, mousestart, e);
      }
      return false;
    }
  }
  function onmouseover(e){
    if(e.target.dataset.index !== undefined){
      let color = ret.getTool().hover||ret.getBlock().hover;
      e.target.style.backgroundColor = color;
    }
  }
  function onmouseout(e){
    if(e.target.closest('#context-menu')){
      return;
    } else {
      if(e.target.dataset.index !== undefined){
        let coords = e.target.dataset.index.split('-').map(e=>~~e);
        e.target.style.backgroundColor = types[ret.get(coords[0], coords[1])].color;
      }
    }
  }
  function oncontextmenu(e){
    contextMenu.classList.remove('hidden');
    contextMenu.style.left = e.clientX+'px';
    contextMenu.style.top = e.clientY-contextMenu.offsetHeight+'px';
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  ret.add('air', {color: '#fff', type: 0, hover: '#bbb'});
  ret.add('stone', {color: "#000", type: 1, hover: "#555"});
  ret.add('water', {color: "#00f", type: 2, hover: "#aaf"});
  ret.add('lava', {color: "#f00", type: 3, hover: "#b33"});
  ret.add('goal', {color: "#2c2", type: 4, hover: "#191"});
  ret.add('trampoline', {color: "#882", type: 5, hover: "#aa8"});
  ret.add('checkpoint', {color: "#c0c", type: 6, hover: "#b1b"});
  ret.add('coin', {color: "#ff0", type: 7, hover: "#bb5"});

  ret.addTool('pencil', {
    create: function(){
      ret.addContextCommand('pencil', {command: function () {
          ret.changeTool('pencil');
      }});
    },
    click: function(x, y, e){
      if(this.get(x, y) === this.getBlock().type){
        this.set(x, y, ret.getBlock('air').type);
        e.target.style.backgroundColor = this.getBlock('air').color;
        ret.push({coords: [{x:x, y:y}]});
      } else {
        this.set(x, y);
        e.target.style.backgroundColor = this.getBlock().color;
        ret.push({coords: [{x:x, y:y}]});
      }
    },
    down: function(x, y, e){
      this.state.save([]);
    },
    move: function(x, y, mousedown, mousestart, e){
      if(mousedown){
        this.set(x, y);
        e.target.style.backgroundColor = this.getBlock().color;
        this.state.save(this.state.get().concat({x:x, y:y}));
        return false;
      }
    },
    up: function(x, y, e){
      ret.push({coords: this.state.get()});
    },
    // render: function (v) {
      // let coords = v.coords;
      // for(var i in coords){
      //   this.set(coords[i].x, coords[i].y);
      //   $('#i-'+coords[i].x+'-'+coords[i].y).style.backgroundColor = this.getBlock().color;
      // }
    // }
  });
  ret.addTool('line', {
    create: function(){
      ret.addContextCommand('line', {command: function () {
          ret.changeTool('line');
      }});
    },
    click: function(x, y, e){
      this.set(x, y);
      e.target.style.backgroundColor = this.getBlock().color;
    },
    down: function(x, y, e){},
    move: function(x, y, mousedown, mousestart, e){
      if(mousedown){
        this.render();
        var slope  = y/x;
        var h = (slope==1)?0:(slope>1?1:-1);
        var total = Math.ceil(diagDist(mousestart, {x:x, y:y})*1.5);
        var currentArr = [];
        var coords = buildArray(total, (el, i)=>roundP(lerpP(mousestart, {x:x, y:y}, i/total)))
        //console.log(total, coords.length)
        // To get rid of Z's
        // /*
        coords = coords.filter(function(item, index, arr){
          if((index == arr.length-1)||(index == 0)) {
            currentArr.push(true);
            return true;
          }
          if(currentArr[index-1]&&((arr[index-1].y == item.y && arr[index+1].x == item.x)||(arr[index-1].x == item.x && arr[index+1].y == item.y))){
                currentArr.push(false);
                return false;
          }
          currentArr.push(true);
          return true;
        });
        //*/
        coords.forEach(i=>$('#i-'+i.x+'-'+i.y).style.backgroundColor = this.getBlock().color);
        this.state.save(coords);
      }
    },
    up: function(x, y, e){
      let coords = this.state.get();
      ret.setAll(coords);
      ret.push({coords:coords});
      this.state.save([]);
    },
    // render: function (v) {
    //     let coords = v.coords;
    //     for(var i in coords){
    //       this.set(coords[i].x, coords[i].y);
    //       $('#i-'+coords[i].x+'-'+coords[i].y).style.backgroundColor = this.getBlock().color;
    //     }
    // }
  });
  ret.addTool('rect', {
    create: function(){
      ret.addContextCommand('rect', {command: function () {
          ret.changeTool('rect');
      }});
    },
    click: function(x, y, e){
      this.set(x, y);
      e.target.style.backgroundColor = this.getBlock().color;
    },
    down: function(x, y, e){},
    move: function(x, y, mousedown, mousestart, e){
      if(mousedown){
        this.render();
        let smallx = Math.min(x, mousestart.x), smally = Math.min(y, mousestart.y);
        let coords = [
          buildArray(Math.abs(x-mousestart.x)+1, (el, i)=>({x:i+smallx, y:y})),
          buildArray(Math.abs(x-mousestart.x)+1, (el, i)=>({x:i+smallx, y:mousestart.y})),
          buildArray(Math.abs(y-mousestart.y)+1, (el, i)=>({y:i+smally, x:x})),
          buildArray(Math.abs(y-mousestart.y)+1, (el, i)=>({y:i+smally, x:mousestart.x})),
          // [{x: x, y: y}]
        ].reduce((a, b)=>a.concat(b));
        coords.forEach(i=>$('#i-'+i.x+'-'+i.y).style.backgroundColor = this.getBlock().color);
        this.state.save(coords);
      }
    },
    up: function(x, y, e){
      let coords = this.state.get();
      ret.setAll(coords);
      ret.push({coords:coords});
      this.state.save(undefined);
    },
    // render: function () {
    //
    // }
  });
  ret.addTool('filledrect', {
    create: function(){
      ret.addContextCommand('filledrect', {command: function () {
          ret.changeTool('filledrect');
      }});
    },
    click: function(x, y, e){
      this.set(x, y);
      e.target.style.backgroundColor = this.getBlock().color;
    },
    down: function(x, y, e){},
    move: function(x, y, mousedown, mousestart, e){
      if(mousedown){
        this.render();
        let height = Math.abs(y-mousestart.y)+1, width = Math.abs(x-mousestart.x)+1;
        var signy = Math.sign(y-mousestart.y), signx = Math.sign(x-mousestart.x);
        let coords = flatten(buildArray(height, (el, iy)=>flatten(buildArray(width, (el, ix)=>({
          x:mousestart.x+ix*signx,
          y:mousestart.y+iy*signy,
        })))));
        coords.forEach(i=>$('#i-'+i.x+'-'+i.y).style.backgroundColor = this.getBlock().color);
        this.state.save(coords);
      }
    },
    up: function(x, y, e){
      let coords = this.state.get();
      ret.setAll(coords);
      ret.push({coords:coords});
      this.state.save(undefined);
    },
    // render: function () {
    //
    // },
    name: 'filled rect',
  });
  ret.addTool('clearrect', {
    create: function(){
      ret.addContextCommand('clearrect', {command: function () {
          ret.changeTool('clearrect');
      }});
    },
    click: function(x, y, e){
      this.set(x, y, ret.getBlock('air').type);
      e.target.style.backgroundColor = ret.getBlock('air').color;
    },
    down: function(x, y, e){},
    move: function(x, y, mousedown, mousestart, e){
      if(mousedown){
        this.render();
        let height = Math.abs(y-mousestart.y)+1, width = Math.abs(x-mousestart.x)+1;
        var signy = Math.sign(y-mousestart.y), signx = Math.sign(x-mousestart.x);
        let coords = flatten(buildArray(height, (el, iy)=>flatten(buildArray(width, (el, ix)=>({
          x:mousestart.x+ix*signx,
          y:mousestart.y+iy*signy,
        }))))).concat({x:x, y:y});
        coords.forEach(i=>$('#i-'+i.x+'-'+i.y).style.backgroundColor = this.getBlock('air').color);
        this.state.save(coords);
      }
    },
    up: function(x, y, e){
      let coords = this.state.get();
      if(coords !== undefined) ret.setAll(coords, 'air');
      ret.push({coords: coords});
    },
    // render: function () {
    //
    // },
    hover: '#fff',
    name: 'clear'
  });
  ret.addTool('erase', {
    create: function(){
      ret.addContextCommand('erase', {command: function () {
          ret.changeTool('erase');
      }});
    },
    click: function(x, y, e){
      this.set(x, y, ret.getBlock('air').type);
      e.target.style.backgroundColor = this.getBlock('air').color;
    },
    down: function(x, y, e){
      this.state.save([]);
    },
    move: function(x, y, mousedown, mousestart, e){
      if(mousedown){
        this.set(x, y, ret.getBlock('air').type);
        e.target.style.backgroundColor = this.getBlock('air').color;
        this.state.save(this.state.get().concat({x:x, y:y}));
        return false;
      }
    },
    up: function(x, y, e){
      ret.push({coords: this.state.get()});
      this.state.save([]);
    },
  });
  ret.addTool('fill', {
    create: function(){
      ret.addContextCommand('fill', {command: function () {
          ret.changeTool('fill');
      }});
    },
    click: function(x, y, e){
      var coords = bfsFill({x:x, y:y}, ret.getBlocks());
      ret.setAll(coords);
      ret.push({coords: coords});
    },
    down: function(x, y, e){},
    move: function(x, y, mousedown, mousestart, e){},
    up: function(x, y, e){},
  });

  ret.addCommand('undo', {
    create: function () {
      ret.addContextCommand('undo', {command: function () {
          ret.undo();
      }});
    },
    exec: function(t){
      this.undo();
    },
    // keys: ['ctrl+z'],
  });
  ret.addCommand('redo', {
    create: function () {
      ret.addContextCommand('redo', {command: function () {
          ret.redo();
      }})
    },
    exec: function(){
      this.redo();
    },
    // keys: ['ctrl+y'],
  });
  ret.addCommand('clear', {
    create: function () {
      ret.addContextCommand('clear', {command: function () {
          ret.clear('air');
      }});
    },
    exec: function(){
      //console.log(5)
      this.clear('air');
    },
  });

  editorContainer.addEventListener("click", function(e){
    //console.log('1')
    onclick(e);
  });
  editorContainer.addEventListener("mousemove", function(e){
    //console.log('2')
    onmousemove(e);
  });
  editorContainer.addEventListener("mouseup", function(e){
    //console.log('3')
    onmouseup(e);
  });
  editorContainer.addEventListener("mousedown", function(e){
    //console.log('4')
    onmousedown(e);
  });
  editorContainer.addEventListener("mouseover", function(e){
    //console.log('5')
    onmouseover(e);
  });
  editorContainer.addEventListener("mouseout", function(e){
    //console.log('6')
    onmouseout(e);
  });
  editorContainer.addEventListener("contextmenu", function(e){
    //console.log('6')
    oncontextmenu(e);
  });

  configContainer.addEventListener("change", ret.updateConfigValues);
  publishButton.addEventListener("click", function(e) {
    ret.setName(levelName.value);
    ret.setPass(editPassword.value);
    ret.onsend();
  });
  importButton.addEventListener('click', function (e) {
    ret.onget(importName.value);
  });

  // editorContainer.addEventListener("touchmove", function(e){
  //   // mousedown = !mousedown;
  //   //console.log('7')
  //   onmousemove(e);
  // });
  // editorContainer.addEventListener("touchend", function(e){
  //   // mousedown = !mousedown;
  //   //console.log('8')
  //   onmouseup(e);
  //   e.cancelBubble = true;
  //   if (e.stopPropagation) e.stopPropagation();
  //   e.preventDefault();
  //   return true;
  // });
  // editorContainer.addEventListener("touchstart", function(e){
  //   mousedown = !mousedown;
  //   //console.log('9')
  //   onmousedown(e);
  // });

  let blockButton = $("#blocks");
  let blockDropdown = $("#block-dropdown");

  let levelType = $('#config-level-type');
  let jumpHeight = $('#config-jump-height');
  let playerSpeed = $('#config-player-speed');

  document.body.addEventListener('click', function (e) {
    var d = e.target.dataset;
    if(d.panel !== undefined){
      $('#'+d.panel).classList.toggle('hidden');
    }
    /*if(d.close !== undefined){
      $('#'+d.close).classList.add('hidden');
    }*/
    if(!e.target.closest('#block-dropdown')) blockButton.classList.add('hidden');
  });
  document.body.addEventListener("keydown", function (e) {
    if(true){
      console.log(e);
      if(e.key === "Control"){
        ctrlkey = true;
      }
      if(ctrlkey){
        if(e.key === 'z') editor.undo();
        if(e.key === 'y') editor.redo();
      }
    }
    // $('#editor-right').addEventListener("keydown", function (e) {
  });
  document.body.addEventListener("keyup", function (e) {
    if(true){
      console.log(e);
      if(e.key === "Control"){
        ctrlkey = false;
      }
    }
    // $('#editor-right').addEventListener("keydown", function (e) {
  });
  return ret;
})();
editor.changeBlock("stone");
editor.changeTool("pencil");
editor.render();

draggable(['#editor-left', '#editor-right'], {sizes: ['20%', '80%'], snap: 75, minSize: 0, mobile: false});

/*
let io = function () {
  // var observers = {}
  return {
    observers: {},
    on: function (o, func) {
      if(this.observers[o]) this.observers[o].push(func);
      else this.observers[o] = [func];
    },
    emit: function (e) {
      console.log(e);
      (this.observers[e]||[]).forEach(i=>i.apply(i, Array.prototype.slice.call(arguments, 1)));
    }
  }
};
/*/
// let io = function () {}
//*/
let socket = io();
if(socket !== undefined){
  //console.log()
  socket.on('usedUrl', () => {
  	$('#levelExists-name').innerText = editor.getName();
    $('#levelExists-modal-container').classList.toggle('hidden');
  });
  socket.on('level_data', (data, config) => {
  	editor.render(editor.deserialize(data));
    editor.setLevelData(config);
    editor.updateConfigDom();
  	/*editor.setGrav(grav);
  	if (editor.getPlatformColor() !== false) {
  		$('#config-platform-color').checked = true;
      $('#config-panel-platform-color').classList.remove('hidden')
      editor.setColor(color)
  	} else {
  		$('#config-platform-color').checked = false;
      $('#config-panel-platform-color').classList.add('hidden')
      editor.setColor('#000000');
  	}
  	editor.setSideSpeed(side);*/
  });
  socket.on('not_exist', (name) => {
  	$('#levelNotExists-name').innerText = name||editor.getName();
    $('#levelNotExists-modal-container').classList.toggle('hidden');
  });
  socket.on("madeLevel",(levelName,isUpdate)=>{
  	$('#levelSuccess-name').innerText = editor.getName();
  	$('#levelSuccess-type').innerText = (isUpdate?"updated":"created")
    $('#levelSuccess-modal-container').classList.toggle('hidden');
    $('#levelSuccess-play').href = "/levels/"+encodeURIComponent(levelName)
    $('#levelSuccess-play').target = '_blank';
    // window.open("/levels/"+encodeURIComponent(levelName));
  });
  socket.on('levelList',(listLevels)=>{
    sortableList.update(listLevels);
  });

  socket.emit("listLevels");

  function toggleSelectModal(){
    socket.emit("listLevels");
    $("#select-modal-container").classList.toggle("hidden");
  }

  function sendLevel(){
    socket.emit('full_porting', editor.getLevelData(), editor.serialize());
    /*socket.emit('start_porting', editor.getLevelData());
    editor.getBlocks().forEach(e=>socket.emit('next_line', e));
  	socket.emit('end_porting');*/
  }
  function getLevel(name){
  	socket.emit('retrieve_level', decodeURIComponent(name));
    editor.setName(name, true);
  	editor.setPass('');
  }

  editor.onsend = sendLevel;
  editor.onget = getLevel;
}

/*
TODO:
- fix weird movement bug

- Lines, boxes etc
- Clear, erase, fill
- Anti-Aliasing
- Jump size indicator
- Undo/Redo
- Context menu
- Commands

- Primary and secondary cursors
- Environment controls
- Styles
- Test level
- Copy, cut, move
- Shift click (where people dont have to hold down)
- Mobile (like shift click)
- Autogen
- Thickness
- Player start
- Player end
- Compress
- Fix line bugs (ceiling/floor)
*/
