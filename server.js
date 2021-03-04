const express = require("express")
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3000;

app.use(express.static("public"));

let userList = [];
let messages = [];

io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  
    socket.on("addMessage", (name, message) => {
        messages.push(name + ": " + message);
        socket.broadcast.emit("newMessage", {username: name, content: message});    
    });

    socket.on("login", (username) => {
        userList.push(username);
        io.to(socket.id).emit("previousMessages", messages);
    }); 
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
