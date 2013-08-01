/*
 * Copyright (c) 2013, Geraldo Augusto Massahud Rodrigues dos Santos
 *
 * WebRTC copy & paste client
 *
 * It's the answerer that receives offers from clients.
 *
 * The connection establishment will happen using copy & paste from/to each console, 
 * guided by console instructions.
 *
 */


console.log("SERVER");

console.log("THE FIRST STEP IS ON THE CLIENT CONSOLE");

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
        "iceServers": [createIceServer("stun:stun.l.google.com:19302")]
    };
}
else if (webrtcDetectedBrowser == "firefox") {
    iceServers = {
        "iceServers": [createIceServer("stun:stun.services.mozilla.com")]
    };
}


var pc = new RTCPeerConnection(iceServers, options);
pc.onicecandidate = onIceCandidate;
pc.ondatachannel = onDataChannel;

var channel;


var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    }
};

function receiveOffer(offerSdp) {

    pc.ondatachannel = onDataChannel;
    pc.setRemoteDescription(offerSdp);
    pc.createAnswer(onDescription, null, mediaConstraints);

}

function onDataChannel(event) {
    channel = event.channel;
    channel.onmessage = onMessage;
    channel.onopen = onChannelStateChange;
    channel.onclose = onChannelStateChange;
}

function setCandidate(candidateJson) {
    var candidate = JSON.parse(candidateJson);
    pc.addIceCandidate(candidate);
}

var iceCandidates = [];

function onIceCandidate(event) {
    if (event.candidate) {
        iceCandidates.push(event.candidate);
    }
}


function onChannelStateChange(event) {

    if (event.srcElement.readyState == "open") {
        console.log("CONNECTION ESTABLISHED: now use channel.send('message') to send messages");
    }
}

function onDescription(desc) {
    console.log("2 - Answer created. Send answer to client. Copy & Paste on the client console:");
    console.log('setRemoteDescription(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(desc).replace(/\\/g, "\\\\") + '\')));');
    pc.setLocalDescription(desc);
}

function setCandidates(candidates) {
    for (var i = 0; i < candidates.length; i++) {
        pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    console.log("4 - SEND ice candidates to client. Copy & Paste on the client console:");
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