/*
 * Copyright (c) 2013, Geraldo Augusto Massahud Rodrigues dos Santos
 *
 * WebRTC copy & paste answerer
 *
 * The connection establishment will happen using copy & paste from/to each console, 
 * guided by console instructions.
 *
 */

var iceServers;
var options = {
    optional: [{
        DtlsSrtpKeyAgreement: true
    }, {
        RtpDataChannels: true
    }]
};
var channel;
var pc;
var mediaConstraints;

var iceCandidates = [];

function initialize() {
    addStep("ANSWERER");

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


    pc = new RTCPeerConnection(iceServers, options);
    pc.onicecandidate = onIceCandidate;
    pc.ondatachannel = onDataChannel;

    


    mediaConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    };

    addStep("Waiting for offer, go to the offerer window get it");

}

function selectText(element) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    }
    else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(element);
        window.getSelection().addRange(range);
    }
}

function addStep(message) {
    var content = document.getElementById('content');
    var div = document.createElement('div');
    div.setAttribute('class', 'step');
    div.innerHTML = message;
    div.onclick = function() {selectText(this);};
    content.appendChild(div);
    window.scrollTo(0, document.height);
}


function receiveOffer(offerSdp) {
    addStep("Offer received");

    pc.ondatachannel = onDataChannel;
    pc.setRemoteDescription(offerSdp);

    if (webrtcDetectedBrowser == "chrome") {
        pc.createAnswer(onDescription, null, mediaConstraints);
    }
    else {
        // firefox bug needs to establish an audio or video stream for data connection
        getUserMedia({
            audio: true,
            fake: true
        }, function(stream) {
            console.log('getUserMedia');
            pc.addStream(stream);
            pc.createAnswer(onDescription, null, mediaConstraints);

        }, function(erro) {
            addStep("Error creating fake audio stream: " + erro);
        });
    }


}

function onDataChannel(event) {
    channel = event.channel;
    addStep("Data channel obtained");
    channel.onmessage = onMessage;
    channel.onopen = onChannelStateChange;
    channel.onclose = onChannelStateChange;
}

function setCandidate(candidateJson) {
    var candidate = JSON.parse(candidateJson);
    pc.addIceCandidate(candidate);
}

function onIceCandidate(event) {
    if (event.candidate) {
        iceCandidates.push(event.candidate);
    }
}


function onChannelStateChange(event) {
    if (event.type == "open") {
        addStep("CONNECTION ESTABLISHED: now use channel.send('message') on console to send messages");
    }
}

function onDescription(desc) {
    pc.setLocalDescription(desc);
    addStep("Answer created and set as peer connection local description.");
    addStep("Send answer to offerer. Copy & Paste the next code on the offerer console:");
    addStep('setRemoteDescription(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(desc).replace(/\\/g, "\\\\") + '\')));');


}

function setCandidates(candidates) {
    for (var i = 0; i < candidates.length; i++) {
        pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    addStep("Added ICE candidates from offerer");
    if (webrtcDetectedBrowser == "chrome") {
        addStep("Send ice candidates to offerer. Copy & Paste the next code on the offerer console:");
        addStep("setCandidates(JSON.parse('" + JSON.stringify(iceCandidates).replace(/\\/g, "\\\\") + "'));")
    }
}



function close() {
    console.log("close");
    channel.close();
    pc.close();

}

function onMessage(event) {
    addStep('Message received: ' + event.data);
}