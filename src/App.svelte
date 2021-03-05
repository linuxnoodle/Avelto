{#if !loggedIn && document.cookie == ""}
    <form action="#" onsubmit="return false">
        <input bind:value={username} class="form-control" placeholder="Username" id="userName" style="left:0.05vw; bottom:4vh;">
        <button on:click={login}>login</button>
    </form>
{:else}
    <div id="projects">
        <div id="projectContainer" class="card" bind:this={projectContainer}/>
        <button on:click={() => {addCard("", true)}}>add card</button>
    </div>

    <div id="chat-container">
        <div id="messageCard" class="card">
            <h1 style="margin-top: 0; text-align: center; color: #eb9b21">{username}</h1>
            <div id="messageContainer" bind:this={messageContainer}></div>
        </div>
    </div>

    <div id="submit">
        <form action="#" onsubmit="return false">
            <input style="max-width:19vw; width:100%; bottom:4vh; left: 0px;" autocomplete="off" id="messageInput" placeholder="Message {username}" type="text" maxlength="100" bind:value={messageText}/>                  
            <button on:click|preventDefault={sendMessage}>send</button>          
        </form>                                                     
    </div>
{/if}
<script>
    let socket = io("ws://localhost:3000");
    let username = document.cookie.split(";")[0];
    let loggedIn = false;

    let projectContainer;
    let messageContainer;

    let messageText = "";

    let messageCount = 0;
    setInterval(() => {
        messageCount = 0;    
    }, 5000);
    
    let cardCount = 0;

    if (document.cookie != ""){
        login();
    }

    socket.on("newMessage", (message) => {
        drawMessage(message.username + ": " + message.content);
    });

    socket.on("previousMessages", (data) => {
        for (let i = 0; i < data.pastMessages.length; ++i){
            drawMessage(data.pastMessages[i]);
        }
        for (let i = 0; i < data.pastCards.length; ++i){
            addCard(data.pastCards[i].contents, false); 
        }
    });

    socket.on("cardAdded", (card) => {
        addCard(card.contents, false)    
    });

    socket.on("cardEdited", (card) => {
        let textarea = document.getElementById("text" + card.cardNum);
        textarea.value = card.contents;
    });

    function login(){
        socket.emit("login", username);
        document.cookie = username + "; SameSite=Strict";
        loggedIn = true;
    }

    function sendMessage(){
        if (messageText.replace(/\s/g,'') == "" || messageCount > 3) return;    
        drawMessage(username + ":  " + messageText);
        socket.emit("addMessage", username, messageText);
        messageText = "";
        ++messageCount;
        document.getElementById("messageCard").scrollIntoView({behavior:"smooth", block:"end"});    
    }

    function drawMessage(content){
        let element = document.createElement("p");
        element.textContent = content;
        messageContainer.appendChild(element);
    }
    
    function addCard(content, shouldEmit){
        ++cardCount;
        let element = document.createElement("div");
        let text = document.createElement("textarea");
            
        text.textContent = content;
        text.id = "text" + cardCount;
            text.style = "width:100%; height:80vh; background-color:#202020; color:white; resize: none;";

        element.appendChild(text);
        element.className = "projectCard";
        element.id = "card" + cardCount;
        projectContainer.appendChild(element);
        text.onkeyup = (event) => {
            let textArea = document.getElementById(event.target.id);
            socket.emit("editCard", event.target.id.slice(4), textArea.value);
        } 
        if (shouldEmit){
            socket.emit("addCard", username, content);
        }
    }
</script>
