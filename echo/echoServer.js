/*
 * WebRTC echo server
 * É o offerer, os clientes devem pegar o offer description de algum lugar. No caso atual, copiar o JSON do console mesmo.
 * Depois disso ele deve adicionar o answer description gerado pelo cliente.
 */
 
 console.log("SERVIDOR");
 console.log("SIGA OS PASSOS PARA ESTABELECER A COMUNICAÇÃO.");
 
 
 var pc = new webkitRTCPeerConnection({"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}, {optional: [{RtpDataChannels: true}]});
 pc.onicecandidate = onIceCandidate;
 
 var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false, // Hmm!!
        OfferToReceiveVideo: false // Hmm!!
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
     channel= pc.createDataChannel('RTCDataChannel',{reliable:false});
     channel.onopen = onChannelStateChange;
     channel.onclose = onChannelStateChange;
 }
 
 function setRemoteDescription(desc) {
     pc.setRemoteDescription(desc);
     console.log("3 - Passar iceCandidates para o cliente. Copie e cole no cliente:");
     console.log("setCandidates(JSON.parse('" + JSON.stringify(iceCandidates).replace(/\\/g,"\\\\") + "'));")
 }
 
 function setCandidates(candidates) {
     for (var i = 0; i < candidates.length; i++) {
        pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
     }     
 }
 
 function onChannelStateChange(event) {
     if (event.readyState==="open") {
        console.log("CONCLUÍDO: agora utilize channel.send para enviar mensagens");     
     }
 }
 
 function onDescription(desc) {
     console.log("1 - Passar offerSDP para o cliente. Copie e cole no cliente:");
     pc.setLocalDescription(desc);
     console.log('createAnswer(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(desc).replace(/\\/g,"\\\\") + '\')));')
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