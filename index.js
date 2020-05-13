const express = require('express');
const bodyParser = require('body-parser');
(require("dotenv")).config();



const app = express();
const sha1 = require('sha1');
const salt = 'IwOg0yYImA';

const seedrandom = require('seedrandom');
const saltMaker = require("randomstring").generate;



//Pug stuff
app.set('view engine', 'pug');
//Use res.render("pugfilename.pug"/*place pug files in views folder */,{param1:"value",numberforrandom:12345}


function getColorFromSeed(seed) { //Takes seed (random number) and generates a hexadecimal color code from it (this is for the levels)
    let myrng = seedrandom(Number(seed));
    let asrgbcolor = [Math.floor(myrng() * 255), Math.floor(myrng() * 255), Math.floor(myrng() * 255)]; //gets a random # for rbg value yeah
    let hexcolor = "#";
    for (i in asrgbcolor) {
        let h = asrgbcolor[i].toString(16);
        if (h.length == 1) {
            hexcolor += "0" + h;
        } else {
            hexcolor += h;
        }
    }
    return hexcolor;
}



var io = require('socket.io')(app.listen(process.env.PORT || 3000, () => console.log('server started')));

function personConnection(id) {
    self = {
        id: id,
        porting: false,
        totalData: [],
        curr_url: '',
        pw: '',
        gravity: 10,
        platformColor: "__NONE__",
        side: 5
    };
    return self;
} //Each person sends this data when they send a level, like if they are porting the level to the server (when they are, they send data, then stop and porting=false), the level data, the level name that will become part of the url (like /levels/hard is level name 'hard'), the password that the data needs to be changed, the gravity (jump height in actuality), the color of the platforms (__NONE__ if it is random every time, and the side-to-side speed)

//Firebase stuff

var admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        project_id: process.env.PROJECTID,
        client_email: process.env.CLIENTEMAIL,
        private_key: process.env.PRIVATEKEY.replace(/\\n/g, "\n")
    }),
    databaseURL: process.env.DATABASEURL
}); //logs in to firebase, I can show you the details later
//firebase keeps a level list
//each level has certain pieces
var db = admin.firestore();
const settings = {
    timestampsInSnapshots: true
};
db.settings(settings);



function createListThing() {
    let listOfLevels = [];
    db.collection('levels').get().then(snapshot => {
        snapshot.forEach(doc => {
            listOfLevels.push(doc.data().name);
        });
        console.log(JSON.stringify(listOfLevels));
    })
}
// createListThing();

function postLevel(theLevelName, levelData, pw, color, gravity, side, socket) { //communiates stuff to firebase, this is mostly very hard to read, don't bother if you don't want to

    theLevelName = encodeURIComponent(theLevelName).replace(/\./g, '%2E');
    hello = false;
    count = 0;
    if (theLevelName == "") {
        socket.emit("empty_name")
    } else {
        db
            .collection('levels').where("name", "==", theLevelName)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    if (doc.data().name == theLevelName) {
                        if (doc.data().pw == sha1(doc.data().salt + pw)) {
                            db.collection("levels").doc(doc.id).update({
                                data: levelData,
                                platformColor: color,
                                gravity: gravity,
                                xMomentum: side
                            });
                            socket.emit("madeLevel", decodeURIComponent(theLevelName).replace("%2E", "."), true)
                        } else {
                            socket.emit('usedUrl');
                        }
                        hello = true;
                    }
                    count++;
                });
            })
            .then(() => {
                if (!hello) {
                    db.collection("metadata").doc("documentString").get().then(doc => {
                        hello = JSON.parse(doc.data().list);
                        hello.push(theLevelName);
                        db.collection("metadata").doc("documentString").update({
                            list: JSON.stringify(hello)
                        });
                    });
                    let tempSalt = saltMaker();
                    db.collection('levels').add({
                        name: theLevelName,
                        data: levelData,
                        pw: sha1(tempSalt + pw),
                        platformColor: color,
                        gravity: gravity,
                        xMomentum: side,
                        salt: tempSalt
                    });
                    socket.emit("madeLevel", decodeURIComponent(theLevelName).replace("%2E", "."), false);
                }
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }
}

function fetchLevel(theLevelName, socket, newTab = false, res = null, editor = false, ThreeD = "true", doOld = "false") {
    count = 0;
    done = false;
    //theLevelName=encodeURIComponent(theLevelName).replace(/\./g, '%2E');
    testLevelName = encodeURIComponent(theLevelName).replace(/\./g, "%2E");
    db
        .collection('levels').where("name", "==", testLevelName)
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                let dataName = decodeURIComponent(doc.data().name).replace("%2E", ".")
                if (!done && dataName == theLevelName) {
                    if (
                        doc.data().hasOwnProperty('platformColor') &&
                        doc.data().platformColor != '__NONE__'
                    ) {
                        pc = doc.data().platformColor;
                        colorString = 'colors="' + pc + '";';
                    } else {
                        pc = null;
                        colorString = '';
                    }
                    if (doc.data().hasOwnProperty('gravity')) {
                        grav = doc.data().gravity;
                        gravString = 'maxYVel=' + grav + ';';
                    } else {
                        grav = 10;
                        gravString = '';
                    }
                    if (doc.data().hasOwnProperty('xMomentum')) {
                        side = doc.data().xMomentum;
                        sideString = 'maxXVel=' + side + ';'
                    } else {
                        side = "5";
                        sideString = ''
                    }
                    if (editor) {
                        res.render('testeditlevel', {
                            title: "Editor: " + dataName,
                            onloadThing: "editor.render(editor.deserialize('" + doc.data().data + "'));editor.setLevelData({jumpHeight:" + grav + ",sideSpeed:" + side + ",color:'" + pc + "'});editor.updateConfigDom()",
                        })
                    } else if (!newTab) {
                        if (doOld == "false") {
                            socket.emit("level_data", doc.data().data, {
                                color: pc,
                                jumpHeight: grav,
                                sideSpeed: side
                            })
                        } else {
                            socket.emit('level_data', doc.data().data, {
                                color: pc,
                                jumpHeight: grav,
                                sideSpeed: side
                            });
                        }
                    } else {
                        res.render((doOld == "true" ? "" : "newUI") + 'level', {
                            linkToEdit: "/editor/" + encodeURIComponent(dataName).replace(/\./g, "%2E"),
                            title: "User Level " + dataName,
                            onloadThing: sideString + colorString + gravString + 'setupWithArray("' + doc.data().data + '");' + (ThreeD == "true" ? "doVels=null;renderer.render(scene,camera);" : ""),
                            isRandom: "__NO__",
                            doThreeD: (ThreeD == "true" ? "TRUE" : "FALSE"),
                            permalink: "https://www.blockyjump.me/levels/" + encodeURIComponent(dataName).replace(/\./g, "%2E"),
                        })


                    }
                    done = true;
                }
                count++;
            });
        })
        .then(() => {
            if (!done) {
                if (!newTab) {
                    socket.emit('not_exist');
                } else {
                    res.send('Level ' + theLevelName + ' does not exist.');
                }
            }
        })
        .catch(err => {
            console.log(err);
        });
}

allAccounts = {};
allSockets = {};
app.get("/help", (req, res) => {
    res.sendFile(__dirname + "/tutorial.html");
});


io.sockets.on('connection', socket => {
    socket.id = Math.random();
    player = new personConnection();
    allSockets[socket.id] = socket;
    allAccounts[socket.id] = player;
    socket.on('get_level', urlThing => {
        fetchLevel(urlThing, socket);


    });

    // socket.on('listLevels', () => {
    //   allNames = [];
    //   db
    //     .collection('levels')
    //     .get()
    //     .then(snapshot => {
    //       snapshot.forEach(doc => {
    //         allNames.push(decodeURIComponent(doc.data().name).replace("%2E", "."));
    //       });
    //     })
    //     .then(() => {
    //       socket.emit('levelList', allNames);
    //     });
    // });
    socket.on('listLevels', () => {
        db.collection("metadata").doc("documentString").get().then(doc => {
            socket.emit("levelList", JSON.parse(doc.data().list).map(i => {
                return decodeURIComponent(i).replace("%2E", ".")
            }));
        })
    })
    socket.on("full_porting", (all_data, levelString) => {
        postLevel(
            all_data.name,
            levelString,
            all_data.password,
            all_data.color,
            all_data.jumpHeight,
            all_data.sideSpeed,
            socket
        );
    });
    socket.on("retrieve_level", (levelName) => {
        fetchLevel(levelName, socket, false, null, false, null, false, "false");
    })
    socket.on('start_porting', (url, pw, color, gravity, side) => {
        player.porting = true;
        player.totalData = [];
        player.platformColor = color;
        player.gravity = gravity;
        player.url = url;
        player.pw = pw;
        player.side = side;
    });
    socket.on('next_line', data => {
        player.totalData.push(data);
    });
    socket.on('end_porting', () => {
        allStuff = [];
        done = false;
        player.porting = false;

        if (player.url != "") {
            postLevel(
                player.url,
                player.totalData.join(','),
                player.pw,
                player.platformColor,
                player.gravity,
                player.side,
                socket
            );
        }


    });
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use("/", express.static('public'));
app.use((req, res, callback) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    callback();
})
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
app.get('/', (req, res) => {
    let randomNumThing = Math.random() * 10000000000000000;
    const doBigInt = Math.floor(randomNumThing) === randomNumThing || randomNumThing + 1 - 1 !== randomNumThing || randomNumThing - 2 + 1 + 1 !== randomNumThing;
    hexcolor = getColorFromSeed(randomNumThing);
    res.render("newUIlevel", {
        title: "Blocky Jump",
        onloadThing: "Math.seedrandom('" + randomNumThing + "');colors='" + hexcolor + "';setLevel();" + (req.query.threeD != "false" ? "placeBlocks(currentLevel);doVels=null;renderer.render(scene,camera)" : ""),
        permalink: "https://www.blockyjump.me/random/" + randomNumThing,
        isRandom: Number(randomNumThing),
        linkToEdit: "/editor/random/" + randomNumThing,
        title: "Blocky Jump: Make, play, and share platforming levels!",
        isRandom: Number(randomNumThing),
        prevLink: "/random/" + (doBigInt ? BigInt(Math.floor(randomNumThing)) - 1n : randomNumThing - 1).toString(),
        nextLink: "/random/" + (doBigInt ? BigInt(Math.floor(randomNumThing)) + 1n : randomNumThing + 1).toString(),
        doThreeD: (req.query.threeD != "false" ? "TRUE" : "FALSE")
    });
});
app.post("/editor", urlencodedParser, (req, res) => {
    if (req.hasOwnProperty("body") && req.body.hasOwnProperty("data")) {
        res.render('testeditlevel', {
            onloadThing: "editor.render(editor.deserialize('" + req.body.data + "'));editor.updateConfigDom()",
        });
    } else {
        res.redirect("/editor");
    }
})
app.get("/random", (req, res) => {
    res.redirect("/random/" + Math.random() * 10000000000000000);
});

app.get("/random/:randomSeed", (req, res) => {
    let randomNumThing;
    let doBigInt;
    try {
        randomNumThing = Number(req.params.randomSeed);
        doBigInt = Math.floor(randomNumThing) === randomNumThing || randomNumThing + 1 - 1 !== randomNumThing || randomNumThing - 2 + 1 + 1 !== randomNumThing;
    } catch (err) {
        return res.send("Invalid number. The random number to load the level by must be a number.");
    }
    hexcolor = getColorFromSeed(req.params.randomSeed);
    res.render((req.query.doNew = "true" ? "newUI" : "") + "level", {
        title: "Random level #" + req.params.randomSeed,
        linkToEdit: "/editor/random/" + req.params.randomSeed,
        onloadThing: "Math.seedrandom('" + req.params.randomSeed + "');colors='" + hexcolor + "';setLevel();" + (req.query.threeD != "false" ? "placeBlocks(currentLevel);doVels=null;renderer.render(scene,camera)" : ""),
        isRandom: parseFloat(req.params.randomSeed),
        prevLink: (doBigInt ? BigInt(Math.floor(randomNumThing)) - 1n : (randomNumThing - 1)).toString(),
        nextLink: (doBigInt ? BigInt(Math.floor(randomNumThing)) + 1n : (randomNumThing + 1)).toString(),
        doThreeD: (req.query.threeD != "false" ? "TRUE" : "FALSE"),
        permalink: "https://www.blockyjump.me/random/" + req.params.randomSeed
    });
});

// app.get('/levels', (req, res) => {
//   res.sendFile(__dirname + '/levels.html');
// });
app.get('/editor', (req, res) => {
    res.render('testeditlevel.pug', {}
        /*{
            title: "Level Editor",
            dispColor: "__NONE__",
            jumpHeight: 9,
            sideSpeed: 5,
            onloadThing: "makeEditor();"
          }*/
    )
    //res.sendFile(__dirname + '/public/levelcreate.html');
});
app.get('/editor/:levelName', (req, res) => {
    fetchLevel(decodeURIComponent(req.params.levelName), null, true, res, true, ThreeD = false, doOld = req.query.doTest);
});

app.get("/editor/random/:randomSeed", (req, res) => {
    if (isNaN(parseInt(req.params.randomSeed))) {
        return res.send("Invalid number. The random number to load the level by must be a number.");
    } else {
        let hexcolor = getColorFromSeed(req.params.randomSeed);

        res.render("testeditlevel.pug", {
            title: "Editor: Random Level #" + req.params.randomSeed,
            onloadThing: "editor.setLevelData({jumpHeight:" + 10 + ",sideSpeed:" + 5 + ",color:'" + hexcolor + "'});editor.updateConfigDom();editor.genRandom('" + req.params.randomSeed + "');"
        });
    }
});

app.get('/levels/:levelName', (req, res) => {
    fetchLevel(req.params.levelName, null, true, res, editor = false, ThreeD = req.query.threeD, doOld = req.query.doOld);

});
app.get('/test3d', (req, res) => {
    let randomNumThing = Math.random() * 10000000000000000;
    const doBigInt = Math.floor(randomNumThing) === randomNumThing || randomNumThing + 1 - 1 !== randomNumThing || randomNumThing - 2 + 1 + 1 !== randomNumThing;
    hexcolor = getColorFromSeed(randomNumThing);
    res.render("level", {
        title: "Blocky Jump",
        onloadThing: "Math.seedrandom('" + randomNumThing + "');colors='" + hexcolor + "';setLevel();placeBlocks(currentLevel);doVels=null;renderer.render(scene,camera);",
        permalink: "/random/" + randomNumThing,
        linkToEdit: "/editor/random/" + randomNumThing,
        title: "Blocky Jump: Make, play, and share platforming levels!",
        isRandom: randomNumThing,
        prevLink: "/random/" + (doBigInt ? BigInt(Math.floor(randomNumThing)) - 1n : randomNumThing - 1).toString(),
        nextLink: "/random/" + (doBigInt ? BigInt(Math.floor(randomNumThing)) + 1n : randomNumThing + 1).toString(),
        doThreeD: "TRUE"
    });
});
