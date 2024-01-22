
function Video(logContainer)
{
	if (navigator.userAgent.search("MSIE") >= 0) {
	    this.icelinkServerAddress = '52.221.181.10:3478';
    	this.websyncServerUrl = 'https://websync.mapguide.vn/websync.ashx'; // WebSync On-Demand
	}
	else if (navigator.userAgent.search("Chrome") >= 0) {
	    this.icelinkServerAddress = '52.221.181.10:3478';
    	this.websyncServerUrl = 'https://websync.mapguide.vn/websync.ashx'; // WebSync On-Demand
	}
	else if (navigator.userAgent.search("Firefox") >= 0) {
	    this.icelinkServerAddress = '52.221.181.10:3478';
    	this.websyncServerUrl = 'https://websync.mapguide.vn/websync.ashx'; // WebSync On-Demand
	}

    this.localMedia = null;
    this.signalling = null;

    this.audioStream = null;
    this.videoStream = null;
    this.conference = null;

    this.sessionId = null;

    this.addRemoteVideoControlEvent = this.addRemoteVideoControl.bind(this);
    this.removeRemoteVideoControlEvent = this.removeRemoteVideoControl.bind(this);
    this.logLinkInitEvent = this.logLinkInit.bind(this);
    this.logLinkUpEvent = this.logLinkUp.bind(this);
    this.logLinkDownEvent = this.logLinkDown.bind(this);
    
    // For backwards-compability with browsers that do not yet support
    // WebRTC, provide a reference to fm.icelink.webrtc.applet.jar, a
    // Java applet that provides a full WebRTC stack through the exact
    // same JavaScript API you use for modern browsers. You can set this
    // for all browsers - only the ones that need it will use it.
    fm.icelink.webrtc.setApplet({
        path: './fm.icelink.webrtc.applet.jar',
        name: 'IceLink WebRTC for JavaScript'
    });

    // For a better experience in Internet Explorer, provide a reference
    // to FM.IceLink.WebRTC.ActiveX.x86/x64.cab, a pair of controls for
    // ActiveX that provide the same WebRTC stack without Java.
    fm.icelink.webrtc.setActiveX({
        path_x86: './FM.IceLink.WebRTC.ActiveX.x86.cab',
        path_x64: './FM.IceLink.WebRTC.ActiveX.x64.cab'
    });

    fm.icelink.webrtc.setChromeExtension({
        extensionId: 'nidjnlpklmpflfmfflalpddmadlgjckn'
    });
        
    // Log to a DOM container.
    //fm.log.setProvider(new fm.domLogProvider(logContainer, fm.logLevel.Info));
};

Video.prototype.startSignalling = function(callback)
{
    this.signalling = new Signalling(this.websyncServerUrl);
    this.signalling.start(callback);
};

Video.prototype.stopSignalling = function(callback)
{
    if (this.signalling)
    {
        this.signalling.stop(callback);
        this.signalling = null;
    }
};

Video.prototype.startLocalMedia = function(videoContainer, captureScreen, statusVideo, statusAudio, callback)
{
    this.localMedia = new LocalMedia(statusVideo, statusAudio);
    this.localMedia.start(videoContainer, captureScreen, callback);
};

Video.prototype.stopLocalMedia = function(callback)
{
    if (this.localMedia)
    {
        this.localMedia.stop(callback);
        this.localMedia = null;
    }
};

Video.prototype.startConference = function(callback)
{
    // Create a WebRTC audio stream description (requires a
    // reference to the local audio feed).
    this.audioStream = new fm.icelink.webrtc.audioStream(this.localMedia.localMediaStream);
        
    // Create a WebRTC video stream description (requires a
    // reference to the local video feed). Whenever a P2P link
    // initializes using this description, position and display
    // the remote video control on-screen by passing it to the
    // layout manager created above. Whenever a P2P link goes
    // down, remove it.
    this.videoStream = new fm.icelink.webrtc.videoStream(this.localMedia.localMediaStream);
    this.videoStream.addOnLinkInit(this.addRemoteVideoControlEvent);
    this.videoStream.addOnLinkDown(this.removeRemoteVideoControlEvent);
        
    // Create a new IceLink conference.
    this.conference = new fm.icelink.conference(this.icelinkServerAddress, [ this.audioStream, this.videoStream ]);

    // Supply TURN relay credentials in case we are behind a
    // highly restrictive firewall. These credentials will be
    // verified by the TURN server.
    this.conference.setRelayUsername('test');
    this.conference.setRelayPassword('pa55w0rd!');

    // Add a few event handlers to the conference so we can see
    // when a new P2P link is created or changes state.
    this.conference.addOnLinkInit(this.logLinkInitEvent);
    this.conference.addOnLinkUp(this.logLinkUpEvent);
    this.conference.addOnLinkDown(this.logLinkDownEvent);

    // Attach signalling to the conference.
    this.signalling.attach(this.conference, this.sessionId, callback);
};

Video.prototype.addRemoteVideoControl = function(e)
{
    try
    {
        var remoteVideoControl = e.getLink().getRemoteVideoControl();
        this.localMedia.layoutManager.addRemoteVideoControl(e.getPeerId(), remoteVideoControl);
    }
    catch (ex)
    {
        fm.log.error("Could not add remote video control.", ex);
    }
};

Video.prototype.removeRemoteVideoControl = function(e)
{
    try
    {
        if (this.localMedia && this.localMedia.layoutManager)
        {
            this.localMedia.layoutManager.removeRemoteVideoControl(e.getPeerId());
        }
    }
    catch (ex)
    {
        fm.log.error("Could not remove remote video control.", ex);
    }
};

Video.prototype.logLinkInit = function(e)
{
    fm.log.info('Link to peer initializing...');
};

Video.prototype.logLinkUp = function(e)
{
    fm.log.info('Link to peer is UP.');
};

Video.prototype.logLinkDown = function(e)
{
    fm.log.info('Link to peer is DOWN. ' + e.getException().message);
};

Video.prototype.stopConference = function(callback)
{
    // Detach signalling from the conference.
    if (this.signalling)
    {
        this.signalling.detach(function(error)
        {
            if (this.conference)
            {
                this.conference.removeOnLinkInit(this.logLinkInitEvent);
                this.conference.removeOnLinkUp(this.logLinkUpEvent);
                this.conference.removeOnLinkDown(this.logLinkDownEvent);
                this.conference = null;
            }

            if (this.videoStream)
            {
                this.videoStream.removeOnLinkInit(this.addRemoteVideoControlEvent);
                this.videoStream.removeOnLinkDown(this.removeRemoteVideoControlEvent);
                this.videoStream = null;
            }

            if (this.audioStream)
            {
                this.audioStream = null;
            }

            callback(error);
        });
    }
};

Video.prototype.toggleAudioMute = function()
{
    if (this.localMedia)
        return this.localMedia.toggleAudioMute();
    else
        return false;
};

Video.prototype.toggleVideoMute = function()
{
    if (this.localMedia)
        return this.localMedia.toggleVideoMute();
    else
        return false;
};