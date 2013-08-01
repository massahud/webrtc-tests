/*
 * Copyright (c) 2013, Geraldo Augusto Massahud Rodrigues dos Santos
 *
 * WebRTC copy & paste client
 *
 * It's the offerer that starts the communication with the server.
 *
 * The connection establishment will happen using copy & paste from/to each console, 
 * guided by console instructions.
 *
 */

console.log("CLIENT");
console.log("FOLLOW THE CONSOLE STEPS TO OPEN CONNECTION");


var options = {
    optional: [{
        RtpDataChannels: true
    }, {
        DtlsSrtpKeyAgreement: true
    }]
};
var iceServers;
if (webrtcDetectedBrowser == "chrome") {
    iceServers = {
        "iceServers": createIceServer("stun:stun.l.google.com:19302")
    };
}
else if (webrtcDetectedBrowser == "firefox") {
    iceServers = {
        "iceServers": createIceServer("stun:stun.services.mozilla.com")
    };
}


var pc = new RTCPeerConnection(iceServers, options);
pc.onicecandidate = onIceCandidate;

var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false 
    }
};
createChannel();

pc.createOffer(onDescription, null, mediaConstraints);

var channel;



var iceCandidates = [];

function onIceCandidate(event) {
    //console.log("onIceCandidate");
    if (event.candidate) {
        iceCandidates.push(event.candidate);
    }
}

function createChannel() {
    channel = pc.createDataChannel('RTCDataChannel', {
        reliable: false
    });
    channel.onmessage = onMessage;
    channel.onopen = onChannelStateChange;
    channel.onclose = onChannelStateChange;

}



function setCandidates(candidates) {
    for (var i = 0; i < candidates.length; i++) {
        pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
}

function onChannelStateChange(event) {
    if (event.srcElement.readyState == "open") {
        console.log("CONNECTION ESTABLISHED: now use channel.send('message') to send messages");
    }
}

function onDescription(desc) {
    console.log("1 - Offer created. Send offer to server. Copy & Paste on the server console:");
    pc.setLocalDescription(desc);
    console.log('receiveOffer(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(desc).replace(/\\/g, "\\\\") + '\')));')
}

function setRemoteDescription(desc) {
    pc.setRemoteDescription(desc);
    console.log("3 - SEND ice candidates to server. Copy & Paste on the server console:");
    console.log("setCandidates(JSON.parse('" + JSON.stringify(iceCandidates).replace(/\\/g, "\\\\") + "'));")
}

function close() {
    console.log("close");
    channel.close();
    pc.close();
}

function onMessage(event) {
    console.log('Message received: ' + event.data);
}