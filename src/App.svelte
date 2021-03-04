{#if !loggedIn && document.cookie == ""}
    <form action="#" onsubmit="return false">
        <input bind:value={username} class="form-control" placeholder="Username" id="userName" style="left:0.05vw; bottom:4vh;">
        <button on:click={login}>login</button>
    </form>
{:else}
    <div id="projects">
        <div id="projectContainer" bind:this={projectContainer}/>
        <button on:click={addCard}>add card</button>
    </div>

    <div id="chat-container">
        <div class="card">
            <h1 style="margin-top: 0; text-align: center; color: #eb9b21">{username}</h1>
            <div id="messageContainer" bind:this={messageContainer}></div>
        </div>
    </div>

    <div id="submit">
        <form action="#" onsubmit="return false">
            <input style="max-width:19vw; width:100%; bottom:4vh; left: 0px;" id="messageInput" placeholder="Message {username}" type="text" maxlength="100" bind:value={messageText}/>                  
            <button on:click|preventDefault={sendMessage}>send</button>          
        </form>                                                     
    </div>
{/if}
<script>
    let socket = io("ws://localhost:3000");
    let username = document.cookie;
    let loggedIn = false;

    let projectContainer;
    let messageContainer;

    let messageText = "";

    let messageCount = 0;
    setInterval(() => {
        messageCount = 0;    
    }, 5000);
    
    if (document.cookie != ""){
        login();
    }

    socket.on("newMessage", (message) => {
        drawMessage(message.username + ": " + message.content);
    });

    socket.on("previousMessages", (messages) => {
        for (let i = 0; i < messages.length; ++i){
            drawMessage(messages[i]);
        }
    });

    function login(){
        socket.emit("login", username);
        document.cookie = username;
        loggedIn = true;
    }

    function sendMessage(){
        if (messageText.replace(/\s/g,'') == "" || messageCount > 3) return;    
        drawMessage(username + ":  " + messageText);
        socket.emit("addMessage", username, messageText);
        messageText = "";
        ++messageCount;
        messageContainer.scrollIntoView({behavior:"smooth", block:"end"});    
    }

    function drawMessage(content){
        let element = document.createElement("p");
        element.textContent = content;
        messageContainer.appendChild(element);
    }
    
    function addCard(){
        let element = document.createElement("div"); 
        element.class = "card";
        element.appendChild(document.createElement("input"));
        projectContainer.appendChild(element);
    }
</script>
