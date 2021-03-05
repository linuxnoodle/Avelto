const express = require("express")
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3000;

app.use(express.static("public"));

let userList = [];
let messages = [];

let cardCount = 0;
let cardData = [];

io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  
    socket.on("addMessage", (name, message) => {
        messages.push(name + ": " + message);
        socket.broadcast.emit("newMessage", {username: name, content: message});    
    });

    socket.on("login", (username) => {
        userList.push(username);
        io.to(socket.id).emit("previousMessages", {pastMessages: messages, pastCards: cardData});
    }); 

    socket.on("addCard", (name, content) => {
        socket.broadcast.emit("cardAdded", {username: name, contents: content});
        cardData.push({username: name, contents: content});
        cardCount++;
    })

    socket.on("editCard", (num, content) => {
        socket.broadcast.emit("cardEdited", {cardNum: num, contents: content});
        cardData[num - 1].contents = content;
    })
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
