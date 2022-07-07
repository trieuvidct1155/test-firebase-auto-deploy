const express = require('express');
var admin = require('firebase-admin');
var bodyParser = require('body-parser')

let app = express();
let port = 3000;

app.use(bodyParser.json())


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firebase-git-action.firebaseio.com"
});

let firestore = admin.firestore();

app.post("/stories/post", (req, res) => {
    let title = req.body.title;
    let lastUpdate = Date.now();
    let authorName = req.body.authorName;
    let content = req.body.content;
    firestore.collection("stories").add({
        title: title,
        lastUpdate: lastUpdate,
        authorName: authorName,
        content: content,
    });
    res.send({ status: "success" });
});

app.post("/stories/update", async (req, res) => {
    
    let title = req.body.title;
    let lastUpdate = Date.now();
    let ownerID = req.body.uid;
    let content = req.body.content;
    let published = req.body.published;
    let storyID = req.body.storyID;

    let ref = firestore.collection("stories").doc(storyID);
    let oldData = (await ref.get()).data();
    if (oldData != undefined) {
        if (oldData.ownerID == ownerID) {
            try {
                await ref.update({
                    title: title,
                    lastUpdate: lastUpdate,
                    content: content,
                    published: published
                });
                res.send({ status: "success" });
            }
            catch (err) {
                res.send({ status: "failed", error: err });
            }
        }
    }
    else { res.send({ status: "failed", error: "Story not found" }); }
});

app.post("/stories/delete", async (req,res)=>{
    let ownerID = req.body.uid;
    let storyID = req.body.storyID;

    let ref = firestore.collection("stories").doc(storyID);
    let deletion = (await ref.get()).data();


    if (deletion != undefined) {
        if (deletion.ownerID == ownerID) {
            try {
                await firestore.collection("stories").doc(storyID).delete();
                res.send({ status: "success" });
            }
            catch(err){
                res.send({ status: "failed", error: err });
            }
        }
    }
    else { res.send({ status: "failed", error: "Story not found" }); }

});

app.listen(port, () => {
    console.log("Server is running");
});