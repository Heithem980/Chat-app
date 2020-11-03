//get hash from URL.

(function () {
  let dataConnection = null;
  const peersEl = document.querySelector(".peers");
  const sendButtonEl = document.querySelector(".send-new-message-button");
  const newMessageEl = document.querySelector(".new-message");
  const messagesEl = document.querySelector(".messages");
  const theirVideoContainer = document.querySelector(".video-container.them");
  let myPeerId = location.hash.slice(1);

  //connect to peer server.
  let peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { urls: ["stun:eu-turn7.xirsys.com"] },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          urls: [
            "turn:eu-turn7.xirsys.com:80?transport=udp",
            "turn:eu-turn7.xirsys.com:3478?transport=udp",
            "turn:eu-turn7.xirsys.com:80?transport=tcp",
            "turn:eu-turn7.xirsys.com:3478?transport=tcp",
            "turns:eu-turn7.xirsys.com:443?transport=tcp",
            "turns:eu-turn7.xirsys.com:5349?transport=tcp",
          ],
        },
      ],
    },
  });

  const printMessage = (text, who) => {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message", who);
    messageContainer.innerHTML = `<div>${text}</div>`;
    messagesEl.append(messageContainer);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  //print peer id on connection "open" event.
  peer.on("open", (id) => {
    const myPeerIdEl = document.querySelector(".my-peer-id");
    myPeerIdEl.innerText = id;
  });

  peer.on("connection", (connection) => {
    dataConnection = connection;
    const event = new CustomEvent("peer-changed", { detail: connection.peer });
    document.dispatchEvent(event);
  });

  // Eventlistener for click "refresh list"
  const listPeersButtonEl = document.querySelector(".list-all-peers-button");
  listPeersButtonEl.addEventListener("click", () => {
    peer.listAllPeers((peers) => {
      //Add peers to HTML document
      const listItems = peers
        .filter((peerId) => {
          if (peerId === peer._id) return false;
          return true;
        })
        .map((peer) => {
          return `<li><button class="connect-button peerId-${peer}" >${peer}</button></li>`;
        })
        .join("");
      const ul = `<ul>${listItems}</ul>`;
      peersEl.innerHTML = ul;
    });
  });
  //Event listener for Click peer button
  peersEl.addEventListener("click", (event) => {
    if (!event.target.classList.contains("connect-button")) return;

    //Get peetId from buttun element.
    const theirPeerId = event.target.innerText;

    // close existing connection
    if (dataConnection) {
      dataConnection.close();
    }
    //Connect to peer.
    dataConnection = peer.connect(theirPeerId);

    dataConnection.on("open", () => {
      console.log("connection open");

      // Dispatch custum Event with connected peer Id
      const event1 = new CustomEvent("peer-changed", {
        detail: theirPeerId,
      });
      document.dispatchEvent(event1);
    });
  });

  document.addEventListener("peer-changed", (event) => {
    const peerId = event.detail;

    const connectButtonEl = document.querySelector(
      `.connect-button.peerId-${peerId}`
    );

    // remove class connected
    document.querySelectorAll(".connect-button.connected").forEach((Button) => {
      Button.classList.remove("connected");
    });
    // add class connected to clicked button.
    connectButtonEl.classList.add("connected");
    dataConnection.on("data", (textMessage) => {
      printMessage(textMessage, "them");
    });

    theirVideoContainer.querySelector(".name").innerText = peerId;
    theirVideoContainer.classList.add("connected");
    theirVideoContainer.querySelector("start").classList.add("active");
    theirVideoContainer.querySelector("stop").classList.remove("active");
  });

  // send message to peer
  const sendMessage = (e) => {
    if (!dataConnection) return;
    // if ((newMessageEl.value = "")) return;

    if (e.keycode === 13 || e.type === "click") {
      dataConnection.send(newMessageEl.value);
      printMessage(newMessageEl.value, "me");

      // clear text input field.
    }
    // set focus on text input field
    newMessageEl.focus();
  };

  // EventListener for click on "send"
  sendButtonEl.addEventListener("click", sendMessage);
  newMessageEl.addEventListener("keyup", sendMessage);

  // eventListener for click "start video chat"
  const startVideoButton = theirVideoContainer.querySelector(".start");
  const stopVideoButton = theirVideoContainer.querySelector(".stop");
  startVideoButton.addEventListener("click", () => {
    startVideoButton.classList.remove("active");

    stopVideoButton.classList.add("active");
  });
})();
