//get hash from URL.
let myPeerId = location.hash.slice(1);

//connect to peer server.
peer = new Peer(myPeerId, {
  host: "glajan.com",
  port: 8443,
  path: "/myapp",
  secure: true,
});

//print peer id on connection "open" event.
peer.on("open", (id) => {
  const myPeerIdEl = document.querySelector(".my-peer-id");
  myPeerIdEl.innerText = id;
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
        return `<li><button>${peer}</button></li>`;
      })
      .join("");
    const ul = `<ul>${listItems}</ul>`;
    document.querySelector(".peers").innerHTML = ul;
  });
});
