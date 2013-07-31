/*
 * WebRTC echo client
 * É o answerer, deve pegar o offer e atribuí-lo com setRemoteDescription
 */
 
 
 console.log("CLIENTE");
 
 var pc = new webkitRTCPeerConnection({"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}, {optional: [{RtpDataChannels: true}]});
 pc.onicecandidate = onIceCandidate;
 pc.ondatachannel = onDataChannel;
 var channel;
 
 
 var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false, // Hmm!!
        OfferToReceiveVideo: false // Hmm!!
    }
};

function createAnswer(offerSdp) {
    
    pc.ondatachannel = onDataChannel;
    /*
    channel = pc.createDataChannel('RTCDataChannel', {
        reliable: false
    });
    */
    

    pc.setRemoteDescription(offerSdp);
    pc.createAnswer(onDescription, null, mediaConstraints);

}
 
 function onDataChannel(event) {
     console.log('onDataChannel');
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
     //console.log("onIceCandidate");
     if (event.candidate) {
         iceCandidates.push(event.candidate);
     }
 }
 
 
 function onChannelStateChange(event) {
     if (event.readyState==="open") {
        console.log("CONCLUÍDO: agora utilize channel.send para enviar mensagens");     
     }
 }
 
 function setCandidates(candidates) {
     for (var i = 0; i < candidates.length; i++) {
        pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
     }
     console.log("4 - Passar iceCandidates para o cliente. Copie e cole no servidor:");
     console.log("setCandidates(JSON.parse('" + JSON.stringify(iceCandidates).replace(/\\/g,"\\\\") + "'));")
 }
 
 function onDescription(desc) {
     console.log("2 - Repassar answerSDP para o servidor. Copie e cole no servidor:");
     console.log('setRemoteDescription(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(desc).replace(/\\/g,"\\\\") + '\')));');
     pc.setLocalDescription(desc);
 }
 
 function close() {
     console.log("close");
     channel.close();
     pc.close();
     
 }
 
  function onMessage(event) {
     console.log('on message: ' + event.data);
     channel.send('echo: ' + event.data);
 }