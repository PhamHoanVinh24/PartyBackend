
/*
 * Title: IceLink WebSync Extension for JavaScript
 * Version: 2.7.3
 * Copyright Frozen Mountain Software 2011+
 */

(function(name, dependencies, definition) {
    if (typeof define === 'function' && define.amd) { // AMD/RequireJS
        define(name, dependencies, definition);
    } else if (typeof exports === 'object') { // Node/CommonJS
        for (var i = 0; i < dependencies.length; i++) {
            require('./' + dependencies[i]);
        }
        module.exports = definition();
    } else {
        this[name] = definition();
    }
}('fm.icelink.websync', ['fm.websync', 'fm.websync.chat', 'fm', 'fm.icelink', 'fm.websync.subscribers'], function() {

if (typeof global !== 'undefined' && !global.window) { global.window = global; global.document = { cookie: '' }; }

if (!window.fm) { throw new Error("fm must be loaded before fm.icelink.websync."); }

if (!window.fm.icelink) { throw new Error("fm.icelink must be loaded before fm.icelink.websync."); }

if (!window.fm.icelink.websync) { window.fm.icelink.websync = {}; }

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var __hasProp = {}.hasOwnProperty;

var __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


fm.icelink.websync.getVersion = function() {
  return '2.7.3';
};


/*<span id='cls-fm.icelink.websync.shouldLinkArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.shouldLinkArgs
 <div>
 Arguments for join-conference should-link callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.icelink.websync.shouldLinkArgs = (function(_super) {

  __extends(shouldLinkArgs, _super);

  shouldLinkArgs.prototype.__initiator = false;

  shouldLinkArgs.prototype.__joinedPeer = null;

  function shouldLinkArgs() {
    this.getJoinedPeer = __bind(this.getJoinedPeer, this);

    this.getInitiator = __bind(this.getInitiator, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      shouldLinkArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    shouldLinkArgs.__super__.constructor.call(this);
  }

  /*<span id='method-fm.icelink.websync.shouldLinkArgs-getInitiator'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets whether the current process is the initiator.
  	 </div>
  
  	@function getInitiator
  	@return {Boolean}
  */


  shouldLinkArgs.prototype.getInitiator = function() {
    return this.__initiator;
  };

  /*<span id='method-fm.icelink.websync.shouldLinkArgs-getJoinedPeer'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the user that just joined.
  	 </div>
  
  	@function getJoinedPeer
  	@return {fm.icelink.websync.peerClient}
  */


  shouldLinkArgs.prototype.getJoinedPeer = function() {
    return this.__joinedPeer;
  };

  return shouldLinkArgs;

})(fm.websync.baseSuccessArgs);


/*<span id='cls-fm.icelink.websync.joinConferenceCompleteArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.joinConferenceCompleteArgs
 <div>
 Arguments for join-conference complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.icelink.websync.joinConferenceCompleteArgs = (function(_super) {

  __extends(joinConferenceCompleteArgs, _super);

  joinConferenceCompleteArgs.prototype.__isRejoin = false;

  function joinConferenceCompleteArgs() {
    this.getIsRejoin = __bind(this.getIsRejoin, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      joinConferenceCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinConferenceCompleteArgs.__super__.constructor.call(this);
  }

  /*<span id='method-fm.icelink.websync.joinConferenceCompleteArgs-getIsRejoin'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets whether the join call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRejoin
  	@return {Boolean}
  */


  joinConferenceCompleteArgs.prototype.getIsRejoin = function() {
    return this.__isRejoin;
  };

  return joinConferenceCompleteArgs;

})(fm.websync.baseCompleteArgs);


/*<span id='cls-fm.icelink.websync.joinConferenceFailureArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.joinConferenceFailureArgs
 <div>
 Arguments for join-conference failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.icelink.websync.joinConferenceFailureArgs = (function(_super) {

  __extends(joinConferenceFailureArgs, _super);

  joinConferenceFailureArgs.prototype.__conferenceChannel = null;

  joinConferenceFailureArgs.prototype.__isRejoin = false;

  function joinConferenceFailureArgs() {
    this.getIsRejoin = __bind(this.getIsRejoin, this);

    this.getConferenceChannel = __bind(this.getConferenceChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      joinConferenceFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinConferenceFailureArgs.__super__.constructor.call(this);
  }

  /*<span id='method-fm.icelink.websync.joinConferenceFailureArgs-getConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the ID of the conference that failed to be joined.
  	 </div>
  
  	@function getConferenceChannel
  	@return {String}
  */


  joinConferenceFailureArgs.prototype.getConferenceChannel = function() {
    return this.__conferenceChannel;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceFailureArgs-getIsRejoin'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets whether the join call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRejoin
  	@return {Boolean}
  */


  joinConferenceFailureArgs.prototype.getIsRejoin = function() {
    return this.__isRejoin;
  };

  return joinConferenceFailureArgs;

})(fm.websync.baseFailureArgs);


/*<span id='cls-fm.icelink.websync.joinConferenceReceiveArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.joinConferenceReceiveArgs
 <div>
 Arguments for join-conference receive callbacks.
 </div>

@extends fm.websync.subscribeReceiveArgs
*/


fm.icelink.websync.joinConferenceReceiveArgs = (function(_super) {

  __extends(joinConferenceReceiveArgs, _super);

  joinConferenceReceiveArgs.prototype.__publishingPeer = null;

  /*<span id='method-fm.icelink.websync.joinConferenceReceiveArgs-fm.icelink.websync.joinConferenceReceiveArgs'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Initializes a new instance of the <see cref="fm.icelink.websync.joinConferenceReceiveArgs">fm.icelink.websync.joinConferenceReceiveArgs</see> class.
  	 </div>
  	@function fm.icelink.websync.joinConferenceReceiveArgs
  	@param {String} channel The channel over which data was received.
  	@param {String} dataJson The data in JSON format.
  	@param {fm.array} dataBytes The data in binary format.
  	@param {fm.websync.connectionType} connectionType The current connection type.
  	@param {Integer} reconnectAfter The amount of time in milliseconds to pause before reconnecting to the server.
  	@return {}
  */


  function joinConferenceReceiveArgs() {
    this.getPublishingPeer = __bind(this.getPublishingPeer, this);

    var channel, connectionType, dataBytes, dataJson, reconnectAfter;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      joinConferenceReceiveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    channel = arguments[0];
    dataJson = arguments[1];
    dataBytes = arguments[2];
    connectionType = arguments[3];
    reconnectAfter = arguments[4];
    joinConferenceReceiveArgs.__super__.constructor.call(this, channel, dataJson, dataBytes, connectionType, reconnectAfter);
  }

  /*<span id='method-fm.icelink.websync.joinConferenceReceiveArgs-getPublishingPeer'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the user that published the message.
  	 </div>
  
  	@function getPublishingPeer
  	@return {fm.icelink.websync.peerClient}
  */


  joinConferenceReceiveArgs.prototype.getPublishingPeer = function() {
    return this.__publishingPeer;
  };

  return joinConferenceReceiveArgs;

})(fm.websync.subscribeReceiveArgs);


/*<span id='cls-fm.icelink.websync.joinConferenceSuccessArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.joinConferenceSuccessArgs
 <div>
 Arguments for join-conference success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.icelink.websync.joinConferenceSuccessArgs = (function(_super) {

  __extends(joinConferenceSuccessArgs, _super);

  joinConferenceSuccessArgs.prototype.__conferenceChannel = null;

  joinConferenceSuccessArgs.prototype.__isRejoin = false;

  joinConferenceSuccessArgs.prototype.__users = null;

  function joinConferenceSuccessArgs() {
    this.getUsers = __bind(this.getUsers, this);

    this.getIsRejoin = __bind(this.getIsRejoin, this);

    this.getConferenceChannel = __bind(this.getConferenceChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      joinConferenceSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinConferenceSuccessArgs.__super__.constructor.call(this);
  }

  /*<span id='method-fm.icelink.websync.joinConferenceSuccessArgs-getConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the ID of the conference that was joined.
  	 </div>
  
  	@function getConferenceChannel
  	@return {String}
  */


  joinConferenceSuccessArgs.prototype.getConferenceChannel = function() {
    return this.__conferenceChannel;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceSuccessArgs-getIsRejoin'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets whether the join call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRejoin
  	@return {Boolean}
  */


  joinConferenceSuccessArgs.prototype.getIsRejoin = function() {
    return this.__isRejoin;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceSuccessArgs-getUsers'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the array of users in the channel.
  	 </div>
  
  	@function getUsers
  	@return {fm.array}
  */


  joinConferenceSuccessArgs.prototype.getUsers = function() {
    return this.__users;
  };

  return joinConferenceSuccessArgs;

})(fm.websync.baseSuccessArgs);


/*<span id='cls-fm.icelink.websync.leaveConferenceCompleteArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.leaveConferenceCompleteArgs
 <div>
 Arguments for leave-conference complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.icelink.websync.leaveConferenceCompleteArgs = (function(_super) {

  __extends(leaveConferenceCompleteArgs, _super);

  function leaveConferenceCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      leaveConferenceCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveConferenceCompleteArgs.__super__.constructor.call(this);
  }

  return leaveConferenceCompleteArgs;

})(fm.websync.baseCompleteArgs);


/*<span id='cls-fm.icelink.websync.leaveConferenceArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.leaveConferenceArgs
 <div>
 Arguments for a client leaving an IceLink conference.
 </div>

@extends fm.websync.baseInputArgs
*/


fm.icelink.websync.leaveConferenceArgs = (function(_super) {

  __extends(leaveConferenceArgs, _super);

  leaveConferenceArgs.prototype._conferenceChannel = null;

  leaveConferenceArgs.prototype._onComplete = null;

  leaveConferenceArgs.prototype._onFailure = null;

  leaveConferenceArgs.prototype._onSuccess = null;

  leaveConferenceArgs.prototype._unlinkAllOnSuccess = false;

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-fm.icelink.websync.leaveConferenceArgs'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Initializes a new instance of the <see cref="fm.icelink.websync.leaveConferenceArgs">fm.icelink.websync.leaveConferenceArgs</see> class.
  	 </div>
  	@function fm.icelink.websync.leaveConferenceArgs
  	@param {String} conferenceChannel The conference ID.
  	@return {}
  */


  function leaveConferenceArgs() {
    this.setUnlinkAllOnSuccess = __bind(this.setUnlinkAllOnSuccess, this);

    this.setOnSuccess = __bind(this.setOnSuccess, this);

    this.setOnFailure = __bind(this.setOnFailure, this);

    this.setOnComplete = __bind(this.setOnComplete, this);

    this.setConferenceChannel = __bind(this.setConferenceChannel, this);

    this.getUnlinkAllOnSuccess = __bind(this.getUnlinkAllOnSuccess, this);

    this.getOnSuccess = __bind(this.getOnSuccess, this);

    this.getOnFailure = __bind(this.getOnFailure, this);

    this.getOnComplete = __bind(this.getOnComplete, this);

    this.getConferenceChannel = __bind(this.getConferenceChannel, this);

    var conferenceChannel;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      leaveConferenceArgs.__super__.constructor.call(this);
      this.setUnlinkAllOnSuccess(true);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 0) {
      leaveConferenceArgs.__super__.constructor.call(this);
      this.setUnlinkAllOnSuccess(true);
      return;
    }
    if (arguments.length === 1) {
      conferenceChannel = arguments[0];
      leaveConferenceArgs.call(this);
      this.setConferenceChannel(conferenceChannel);
      return;
    }
  }

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-getConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the conference channel.
  	 </div>
  
  	@function getConferenceChannel
  	@return {String}
  */


  leaveConferenceArgs.prototype.getConferenceChannel = function() {
    return this._conferenceChannel;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-getOnComplete'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke after <see cref="fm.icelink.websync.leaveConferenceArgs.onSuccess">fm.icelink.websync.leaveConferenceArgs.onSuccess</see> or <see cref="fm.icelink.websync.leaveConferenceArgs.onFailure">fm.icelink.websync.leaveConferenceArgs.onFailure</see>.
  	 </div>
  
  	@function getOnComplete
  	@return {fm.singleAction}
  */


  leaveConferenceArgs.prototype.getOnComplete = function() {
    return this._onComplete;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-getOnFailure'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke if the request fails.
  	 </div>
  
  	@function getOnFailure
  	@return {fm.singleAction}
  */


  leaveConferenceArgs.prototype.getOnFailure = function() {
    return this._onFailure;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-getOnSuccess'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke if the request succeeds.
  	 </div>
  
  	@function getOnSuccess
  	@return {fm.singleAction}
  */


  leaveConferenceArgs.prototype.getOnSuccess = function() {
    return this._onSuccess;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-getUnlinkAllOnSuccess'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets a value indicating whether this endpoint
  	 should initiate an unlink from everyone after leaving
  	 the channel successfully.
  	 Defaults to <c>true</c>.
  	 </div>
  
  	@function getUnlinkAllOnSuccess
  	@return {Boolean}
  */


  leaveConferenceArgs.prototype.getUnlinkAllOnSuccess = function() {
    return this._unlinkAllOnSuccess;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-setConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the conference channel.
  	 </div>
  
  	@function setConferenceChannel
  	@param {String} value
  	@return {void}
  */


  leaveConferenceArgs.prototype.setConferenceChannel = function() {
    var value;
    value = arguments[0];
    return this._conferenceChannel = value;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-setOnComplete'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke after <see cref="fm.icelink.websync.leaveConferenceArgs.onSuccess">fm.icelink.websync.leaveConferenceArgs.onSuccess</see> or <see cref="fm.icelink.websync.leaveConferenceArgs.onFailure">fm.icelink.websync.leaveConferenceArgs.onFailure</see>.
  	 </div>
  
  	@function setOnComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  leaveConferenceArgs.prototype.setOnComplete = function() {
    var value;
    value = arguments[0];
    return this._onComplete = value;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-setOnFailure'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke if the request fails.
  	 </div>
  
  	@function setOnFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  leaveConferenceArgs.prototype.setOnFailure = function() {
    var value;
    value = arguments[0];
    return this._onFailure = value;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-setOnSuccess'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke if the request succeeds.
  	 </div>
  
  	@function setOnSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  leaveConferenceArgs.prototype.setOnSuccess = function() {
    var value;
    value = arguments[0];
    return this._onSuccess = value;
  };

  /*<span id='method-fm.icelink.websync.leaveConferenceArgs-setUnlinkAllOnSuccess'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets a value indicating whether this endpoint
  	 should initiate an unlink from everyone after leaving
  	 the channel successfully.
  	 Defaults to <c>true</c>.
  	 </div>
  
  	@function setUnlinkAllOnSuccess
  	@param {Boolean} value
  	@return {void}
  */


  leaveConferenceArgs.prototype.setUnlinkAllOnSuccess = function() {
    var value;
    value = arguments[0];
    return this._unlinkAllOnSuccess = value;
  };

  return leaveConferenceArgs;

})(fm.websync.baseInputArgs);


/*<span id='cls-fm.icelink.websync.joinConferenceArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.joinConferenceArgs
 <div>
 Arguments for a client joining an IceLink conference.
 </div>

@extends fm.websync.baseInputArgs
*/


fm.icelink.websync.joinConferenceArgs = (function(_super) {

  __extends(joinConferenceArgs, _super);

  joinConferenceArgs.prototype._conference = null;

  joinConferenceArgs.prototype._conferenceChannel = null;

  joinConferenceArgs.prototype._onComplete = null;

  joinConferenceArgs.prototype._onFailure = null;

  joinConferenceArgs.prototype._onReceive = null;

  joinConferenceArgs.prototype._onSuccess = null;

  joinConferenceArgs.prototype._rejoin = false;

  joinConferenceArgs.prototype._shouldLink = null;

  joinConferenceArgs.prototype._unlinkExistingOnUserJoin = false;

  joinConferenceArgs.prototype._unlinkOnUserLeave = false;

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-fm.icelink.websync.joinConferenceArgs'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Initializes a new instance of the <see cref="fm.icelink.websync.joinConferenceArgs">fm.icelink.websync.joinConferenceArgs</see> class.
  	 </div>
  	@function fm.icelink.websync.joinConferenceArgs
  	@param {String} conferenceChannel The conference channel.
  	@param {fm.icelink.conference} conference The conference
  	@return {}
  */


  function joinConferenceArgs() {
    this.setUnlinkOnUserLeave = __bind(this.setUnlinkOnUserLeave, this);

    this.setUnlinkExistingOnUserJoin = __bind(this.setUnlinkExistingOnUserJoin, this);

    this.setShouldLink = __bind(this.setShouldLink, this);

    this.setRejoin = __bind(this.setRejoin, this);

    this.setOnSuccess = __bind(this.setOnSuccess, this);

    this.setOnReceive = __bind(this.setOnReceive, this);

    this.setOnFailure = __bind(this.setOnFailure, this);

    this.setOnComplete = __bind(this.setOnComplete, this);

    this.setConferenceChannel = __bind(this.setConferenceChannel, this);

    this.setConference = __bind(this.setConference, this);

    this.getUnlinkOnUserLeave = __bind(this.getUnlinkOnUserLeave, this);

    this.getUnlinkExistingOnUserJoin = __bind(this.getUnlinkExistingOnUserJoin, this);

    this.getShouldLink = __bind(this.getShouldLink, this);

    this.getRejoin = __bind(this.getRejoin, this);

    this.getOnSuccess = __bind(this.getOnSuccess, this);

    this.getOnReceive = __bind(this.getOnReceive, this);

    this.getOnFailure = __bind(this.getOnFailure, this);

    this.getOnComplete = __bind(this.getOnComplete, this);

    this.getConferenceChannel = __bind(this.getConferenceChannel, this);

    this.getConference = __bind(this.getConference, this);

    var conference, conferenceChannel;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      joinConferenceArgs.__super__.constructor.call(this);
      this.setUnlinkExistingOnUserJoin(true);
      this.setUnlinkOnUserLeave(true);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 0) {
      joinConferenceArgs.__super__.constructor.call(this);
      this.setUnlinkExistingOnUserJoin(true);
      this.setUnlinkOnUserLeave(true);
      return;
    }
    if (arguments.length === 2) {
      conferenceChannel = arguments[0];
      conference = arguments[1];
      joinConferenceArgs.call(this);
      this.setConferenceChannel(conferenceChannel);
      this.setConference(conference);
      return;
    }
  }

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getConference'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the conference.
  	 </div>
  
  	@function getConference
  	@return {fm.icelink.conference}
  */


  joinConferenceArgs.prototype.getConference = function() {
    return this._conference;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the conference channel.
  	 </div>
  
  	@function getConferenceChannel
  	@return {String}
  */


  joinConferenceArgs.prototype.getConferenceChannel = function() {
    return this._conferenceChannel;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getOnComplete'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke after <see cref="fm.icelink.websync.joinConferenceArgs.onSuccess">fm.icelink.websync.joinConferenceArgs.onSuccess</see> or <see cref="fm.icelink.websync.joinConferenceArgs.onFailure">fm.icelink.websync.joinConferenceArgs.onFailure</see>.
  	 See <see cref="fm.icelink.websync.joinConferenceCompleteArgs">fm.icelink.websync.joinConferenceCompleteArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnComplete
  	@return {fm.singleAction}
  */


  joinConferenceArgs.prototype.getOnComplete = function() {
    return this._onComplete;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getOnFailure'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke if the request fails.
  	 See <see cref="fm.icelink.websync.joinConferenceFailureArgs">fm.icelink.websync.joinConferenceFailureArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnFailure
  	@return {fm.singleAction}
  */


  joinConferenceArgs.prototype.getOnFailure = function() {
    return this._onFailure;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getOnReceive'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke when data is received on the channel.
  	 See <see cref="fm.icelink.websync.joinConferenceReceiveArgs">fm.icelink.websync.joinConferenceReceiveArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnReceive
  	@return {fm.singleAction}
  */


  joinConferenceArgs.prototype.getOnReceive = function() {
    return this._onReceive;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getOnSuccess'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback to invoke if the request succeeds.
  	 See <see cref="fm.icelink.websync.joinConferenceSuccessArgs">fm.icelink.websync.joinConferenceSuccessArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnSuccess
  	@return {fm.singleAction}
  */


  joinConferenceArgs.prototype.getOnSuccess = function() {
    return this._onSuccess;
  };

  joinConferenceArgs.prototype.getRejoin = function() {
    return this._rejoin;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getShouldLink'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the callback used to determine whether a peer link should
  	 be initiated. Return <c>true</c> to initiate a link or <c>false</c> to
  	 ignore the peer. If <c>null</c>, a link will always be initiated.
  	 See <see cref="fm.icelink.websync.shouldLinkArgs">fm.icelink.websync.shouldLinkArgs</see> for callback argument details.
  	 </div>
  
  	@function getShouldLink
  	@return {fm.icelink.websync.shouldLinkCallback}
  */


  joinConferenceArgs.prototype.getShouldLink = function() {
    return this._shouldLink;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getUnlinkExistingOnUserJoin'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets a value indicating whether this endpoint
  	 should drop existing links in favour of new ones
  	 when remote peers join the channel.
  	 Defaults to <c>true</c>.
  	 </div>
  
  	@function getUnlinkExistingOnUserJoin
  	@return {Boolean}
  */


  joinConferenceArgs.prototype.getUnlinkExistingOnUserJoin = function() {
    return this._unlinkExistingOnUserJoin;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-getUnlinkOnUserLeave'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets a value indicating whether this endpoint
  	 should initiate an unlink when remote peers leave the channel.
  	 Defaults to <c>true</c>.
  	 </div>
  
  	@function getUnlinkOnUserLeave
  	@return {Boolean}
  */


  joinConferenceArgs.prototype.getUnlinkOnUserLeave = function() {
    return this._unlinkOnUserLeave;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setConference'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the conference.
  	 </div>
  
  	@function setConference
  	@param {fm.icelink.conference} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setConference = function() {
    var value;
    value = arguments[0];
    return this._conference = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the conference channel.
  	 </div>
  
  	@function setConferenceChannel
  	@param {String} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setConferenceChannel = function() {
    var value;
    value = arguments[0];
    return this._conferenceChannel = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setOnComplete'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke after <see cref="fm.icelink.websync.joinConferenceArgs.onSuccess">fm.icelink.websync.joinConferenceArgs.onSuccess</see> or <see cref="fm.icelink.websync.joinConferenceArgs.onFailure">fm.icelink.websync.joinConferenceArgs.onFailure</see>.
  	 See <see cref="fm.icelink.websync.joinConferenceCompleteArgs">fm.icelink.websync.joinConferenceCompleteArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setOnComplete = function() {
    var value;
    value = arguments[0];
    return this._onComplete = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setOnFailure'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke if the request fails.
  	 See <see cref="fm.icelink.websync.joinConferenceFailureArgs">fm.icelink.websync.joinConferenceFailureArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setOnFailure = function() {
    var value;
    value = arguments[0];
    return this._onFailure = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setOnReceive'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke when data is received on the channel.
  	 See <see cref="fm.icelink.websync.joinConferenceReceiveArgs">fm.icelink.websync.joinConferenceReceiveArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnReceive
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setOnReceive = function() {
    var value;
    value = arguments[0];
    return this._onReceive = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setOnSuccess'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback to invoke if the request succeeds.
  	 See <see cref="fm.icelink.websync.joinConferenceSuccessArgs">fm.icelink.websync.joinConferenceSuccessArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setOnSuccess = function() {
    var value;
    value = arguments[0];
    return this._onSuccess = value;
  };

  joinConferenceArgs.prototype.setRejoin = function() {
    var value;
    value = arguments[0];
    return this._rejoin = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setShouldLink'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the callback used to determine whether a peer link should
  	 be initiated. Return <c>true</c> to initiate a link or <c>false</c> to
  	 ignore the peer. If <c>null</c>, a link will always be initiated.
  	 See <see cref="fm.icelink.websync.shouldLinkArgs">fm.icelink.websync.shouldLinkArgs</see> for callback argument details.
  	 </div>
  
  	@function setShouldLink
  	@param {fm.icelink.websync.shouldLinkCallback} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setShouldLink = function() {
    var value;
    value = arguments[0];
    return this._shouldLink = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setUnlinkExistingOnUserJoin'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets a value indicating whether this endpoint
  	 should drop existing links in favour of new ones
  	 when remote peers join the channel.
  	 Defaults to <c>true</c>.
  	 </div>
  
  	@function setUnlinkExistingOnUserJoin
  	@param {Boolean} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setUnlinkExistingOnUserJoin = function() {
    var value;
    value = arguments[0];
    return this._unlinkExistingOnUserJoin = value;
  };

  /*<span id='method-fm.icelink.websync.joinConferenceArgs-setUnlinkOnUserLeave'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets a value indicating whether this endpoint
  	 should initiate an unlink when remote peers leave the channel.
  	 Defaults to <c>true</c>.
  	 </div>
  
  	@function setUnlinkOnUserLeave
  	@param {Boolean} value
  	@return {void}
  */


  joinConferenceArgs.prototype.setUnlinkOnUserLeave = function() {
    var value;
    value = arguments[0];
    return this._unlinkOnUserLeave = value;
  };

  return joinConferenceArgs;

})(fm.websync.baseInputArgs);


/*<span id='cls-fm.icelink.websync.leaveConferenceFailureArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.leaveConferenceFailureArgs
 <div>
 Arguments for leave-conference failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.icelink.websync.leaveConferenceFailureArgs = (function(_super) {

  __extends(leaveConferenceFailureArgs, _super);

  leaveConferenceFailureArgs.prototype.__conferenceChannel = null;

  function leaveConferenceFailureArgs() {
    this.getConferenceChannel = __bind(this.getConferenceChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      leaveConferenceFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveConferenceFailureArgs.__super__.constructor.call(this);
  }

  /*<span id='method-fm.icelink.websync.leaveConferenceFailureArgs-getConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the ID of the conference that failed to be left.
  	 </div>
  
  	@function getConferenceChannel
  	@return {String}
  */


  leaveConferenceFailureArgs.prototype.getConferenceChannel = function() {
    return this.__conferenceChannel;
  };

  return leaveConferenceFailureArgs;

})(fm.websync.baseFailureArgs);


/*<span id='cls-fm.icelink.websync.leaveConferenceSuccessArgs'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.leaveConferenceSuccessArgs
 <div>
 Arguments for leave-conference success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.icelink.websync.leaveConferenceSuccessArgs = (function(_super) {

  __extends(leaveConferenceSuccessArgs, _super);

  leaveConferenceSuccessArgs.prototype.__conferenceChannel = null;

  function leaveConferenceSuccessArgs() {
    this.getConferenceChannel = __bind(this.getConferenceChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      leaveConferenceSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveConferenceSuccessArgs.__super__.constructor.call(this);
  }

  /*<span id='method-fm.icelink.websync.leaveConferenceSuccessArgs-getConferenceChannel'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the ID of the conference that was left.
  	 </div>
  
  	@function getConferenceChannel
  	@return {String}
  */


  leaveConferenceSuccessArgs.prototype.getConferenceChannel = function() {
    return this.__conferenceChannel;
  };

  return leaveConferenceSuccessArgs;

})(fm.websync.baseSuccessArgs);




fm.icelink.websync.state = (function(_super) {

  __extends(state, _super);

  state.prototype._client = null;

  state.prototype._conference = null;

  state.prototype._conferenceChannel = null;

  state.prototype._joinShouldLink = null;

  state.prototype._onJoinComplete = null;

  state.prototype._onJoinFailure = null;

  state.prototype._onJoinReceive = null;

  state.prototype._onJoinSuccess = null;

  state.prototype._onLeaveComplete = null;

  state.prototype._onLeaveFailure = null;

  state.prototype._onLeaveSuccess = null;

  state.prototype._unlinkAllOnLeaveSuccess = false;

  state.prototype._unlinkExistingOnUserJoin = false;

  state.prototype._unlinkOnUserLeave = false;

  function state() {
    this.setUnlinkOnUserLeave = __bind(this.setUnlinkOnUserLeave, this);

    this.setUnlinkExistingOnUserJoin = __bind(this.setUnlinkExistingOnUserJoin, this);

    this.setUnlinkAllOnLeaveSuccess = __bind(this.setUnlinkAllOnLeaveSuccess, this);

    this.setOnLeaveSuccess = __bind(this.setOnLeaveSuccess, this);

    this.setOnLeaveFailure = __bind(this.setOnLeaveFailure, this);

    this.setOnLeaveComplete = __bind(this.setOnLeaveComplete, this);

    this.setOnJoinSuccess = __bind(this.setOnJoinSuccess, this);

    this.setOnJoinReceive = __bind(this.setOnJoinReceive, this);

    this.setOnJoinFailure = __bind(this.setOnJoinFailure, this);

    this.setOnJoinComplete = __bind(this.setOnJoinComplete, this);

    this.setJoinShouldLink = __bind(this.setJoinShouldLink, this);

    this.setConferenceChannel = __bind(this.setConferenceChannel, this);

    this.setConference = __bind(this.setConference, this);

    this.setClient = __bind(this.setClient, this);

    this.publishOfferAnswer = __bind(this.publishOfferAnswer, this);

    this.publishCandidate = __bind(this.publishCandidate, this);

    this.getUnlinkOnUserLeave = __bind(this.getUnlinkOnUserLeave, this);

    this.getUnlinkExistingOnUserJoin = __bind(this.getUnlinkExistingOnUserJoin, this);

    this.getUnlinkAllOnLeaveSuccess = __bind(this.getUnlinkAllOnLeaveSuccess, this);

    this.getOnLeaveSuccess = __bind(this.getOnLeaveSuccess, this);

    this.getOnLeaveFailure = __bind(this.getOnLeaveFailure, this);

    this.getOnLeaveComplete = __bind(this.getOnLeaveComplete, this);

    this.getOnJoinSuccess = __bind(this.getOnJoinSuccess, this);

    this.getOnJoinReceive = __bind(this.getOnJoinReceive, this);

    this.getOnJoinFailure = __bind(this.getOnJoinFailure, this);

    this.getOnJoinComplete = __bind(this.getOnJoinComplete, this);

    this.getJoinShouldLink = __bind(this.getJoinShouldLink, this);

    this.getInstanceId = __bind(this.getInstanceId, this);

    this.getInstanceChannel = __bind(this.getInstanceChannel, this);

    this.getConferenceChannel = __bind(this.getConferenceChannel, this);

    this.getConference = __bind(this.getConference, this);

    this.getClient = __bind(this.getClient, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      state.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    state.__super__.constructor.call(this);
  }

  state.buildInstanceChannel = function() {
    var conferenceChannel, instanceId;
    conferenceChannel = arguments[0];
    instanceId = arguments[1];
    return fm.stringExtensions.concat("/fm.icelink.websync.instance", conferenceChannel, "/", instanceId);
  };

  state.getCandidateTag = function() {
    return "fm.icelink.websync.candidate";
  };

  state.getConferenceKey = function() {
    return "fm.icelink.websync.state";
  };

  state.getOfferAnswerTag = function() {
    return "fm.icelink.websync.offeranswer";
  };

  state.prototype.getClient = function() {
    return this._client;
  };

  state.prototype.getConference = function() {
    return this._conference;
  };

  state.prototype.getConferenceChannel = function() {
    return this._conferenceChannel;
  };

  state.prototype.getInstanceChannel = function() {
    return fm.icelink.websync.state.buildInstanceChannel(this.getConferenceChannel(), this.getInstanceId());
  };

  state.prototype.getInstanceId = function() {
    return this.getClient().getInstanceId().toString();
  };

  state.prototype.getJoinShouldLink = function() {
    return this._joinShouldLink;
  };

  state.prototype.getOnJoinComplete = function() {
    return this._onJoinComplete;
  };

  state.prototype.getOnJoinFailure = function() {
    return this._onJoinFailure;
  };

  state.prototype.getOnJoinReceive = function() {
    return this._onJoinReceive;
  };

  state.prototype.getOnJoinSuccess = function() {
    return this._onJoinSuccess;
  };

  state.prototype.getOnLeaveComplete = function() {
    return this._onLeaveComplete;
  };

  state.prototype.getOnLeaveFailure = function() {
    return this._onLeaveFailure;
  };

  state.prototype.getOnLeaveSuccess = function() {
    return this._onLeaveSuccess;
  };

  state.prototype.getUnlinkAllOnLeaveSuccess = function() {
    return this._unlinkAllOnLeaveSuccess;
  };

  state.prototype.getUnlinkExistingOnUserJoin = function() {
    return this._unlinkExistingOnUserJoin;
  };

  state.prototype.getUnlinkOnUserLeave = function() {
    return this._unlinkOnUserLeave;
  };

  state.prototype.publishCandidate = function() {
    var candidate, channel, instanceId;
    instanceId = arguments[0];
    candidate = arguments[1];
    channel = fm.icelink.websync.state.buildInstanceChannel(this.getConferenceChannel(), instanceId);
    return this.getClient().publish(new fm.websync.publishArgs(channel, candidate.toJson(), fm.icelink.websync.state.getCandidateTag()));
  };

  state.prototype.publishOfferAnswer = function() {
    var channel, instanceId, offerAnswer;
    instanceId = arguments[0];
    offerAnswer = arguments[1];
    channel = fm.icelink.websync.state.buildInstanceChannel(this.getConferenceChannel(), instanceId);
    return this.getClient().publish(new fm.websync.publishArgs(channel, offerAnswer.toJson(), fm.icelink.websync.state.getOfferAnswerTag()));
  };

  state.prototype.setClient = function() {
    var value;
    value = arguments[0];
    return this._client = value;
  };

  state.prototype.setConference = function() {
    var value;
    value = arguments[0];
    return this._conference = value;
  };

  state.prototype.setConferenceChannel = function() {
    var value;
    value = arguments[0];
    return this._conferenceChannel = value;
  };

  state.prototype.setJoinShouldLink = function() {
    var value;
    value = arguments[0];
    return this._joinShouldLink = value;
  };

  state.prototype.setOnJoinComplete = function() {
    var value;
    value = arguments[0];
    return this._onJoinComplete = value;
  };

  state.prototype.setOnJoinFailure = function() {
    var value;
    value = arguments[0];
    return this._onJoinFailure = value;
  };

  state.prototype.setOnJoinReceive = function() {
    var value;
    value = arguments[0];
    return this._onJoinReceive = value;
  };

  state.prototype.setOnJoinSuccess = function() {
    var value;
    value = arguments[0];
    return this._onJoinSuccess = value;
  };

  state.prototype.setOnLeaveComplete = function() {
    var value;
    value = arguments[0];
    return this._onLeaveComplete = value;
  };

  state.prototype.setOnLeaveFailure = function() {
    var value;
    value = arguments[0];
    return this._onLeaveFailure = value;
  };

  state.prototype.setOnLeaveSuccess = function() {
    var value;
    value = arguments[0];
    return this._onLeaveSuccess = value;
  };

  state.prototype.setUnlinkAllOnLeaveSuccess = function() {
    var value;
    value = arguments[0];
    return this._unlinkAllOnLeaveSuccess = value;
  };

  state.prototype.setUnlinkExistingOnUserJoin = function() {
    var value;
    value = arguments[0];
    return this._unlinkExistingOnUserJoin = value;
  };

  state.prototype.setUnlinkOnUserLeave = function() {
    var value;
    value = arguments[0];
    return this._unlinkOnUserLeave = value;
  };

  return state;

}).call(this, fm.object);


/*<span id='cls-fm.icelink.websync.clientExtensions'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.clientExtensions
 <div>
 Extension methods for <see cref="fm.websync.client">fm.websync.client</see> instances.
 </div>
*/

fm.icelink.websync.clientExtensions = (function() {

  clientExtensions._onLinkCandidateEvent = null;

  clientExtensions._onLinkOfferAnswerEvent = null;

  function clientExtensions() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      clientExtensions.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /*<span id='method-fm.icelink.websync.clientExtensions-joinConference'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Joins an IceLink conference.
  	 </div>
  	@function joinConference
  	@param {fm.websync.client} client The WebSync client.
  	@param {fm.icelink.websync.joinConferenceArgs} joinConferenceArgs The arguments.
  	@return {fm.websync.client} The WebSync client.
  */


  clientExtensions.joinConference = function() {
    var args2, client, conference, conferenceChannel, joinArgs, joinConferenceArgs, state, state2, _var0;
    client = arguments[0];
    joinConferenceArgs = arguments[1];
    conference = joinConferenceArgs.getConference();
    conferenceChannel = joinConferenceArgs.getConferenceChannel();
    if (fm.stringExtensions.isNullOrEmpty(conferenceChannel)) {
      throw new Error("Conference channel cannot be null.");
    }
    _var0 = conference;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("Conference cannot be null.");
    }
    state2 = new fm.icelink.websync.state();
    state2.setClient(client);
    state2.setConference(conference);
    state2.setConferenceChannel(conferenceChannel);
    state2.setOnJoinSuccess(joinConferenceArgs.getOnSuccess());
    state2.setOnJoinFailure(joinConferenceArgs.getOnFailure());
    state2.setOnJoinComplete(joinConferenceArgs.getOnComplete());
    state2.setOnJoinReceive(joinConferenceArgs.getOnReceive());
    state2.setUnlinkExistingOnUserJoin(joinConferenceArgs.getUnlinkExistingOnUserJoin());
    state2.setUnlinkOnUserLeave(joinConferenceArgs.getUnlinkOnUserLeave());
    state2.setJoinShouldLink(joinConferenceArgs.getShouldLink());
    state = state2;
    client.setDynamicValue(state.getConferenceChannel(), state);
    client.setDynamicValue(state.getInstanceChannel(), state);
    conference.setDynamicValue(fm.icelink.websync.state.getConferenceKey(), state);
    args2 = new fm.websync.chat.joinArgs([state.getConferenceChannel(), state.getInstanceChannel()], "fm.icelink.websync");
    args2.setUserId(state.getInstanceId());
    args2.setUserNickname("fm.icelink.websync");
    args2.setRequestUrl(joinConferenceArgs.getRequestUrl());
    args2.setSynchronous(joinConferenceArgs.getSynchronous());
    args2.setOnSuccess(clientExtensions.onJoinSuccess);
    args2.setOnFailure(clientExtensions.onJoinFailure);
    args2.setOnReceive(clientExtensions.onJoinReceive);
    args2.setOnUserJoin(clientExtensions.onUserJoin);
    args2.setOnUserLeave(clientExtensions.onUserLeave);
    args2.setDynamicProperties(joinConferenceArgs.getDynamicProperties());
    joinArgs = args2;
    joinArgs.copyExtensions(joinConferenceArgs);
    return fm.websync.chat.clientExtensions.join(client, joinArgs);
  };

  /*<span id='method-fm.icelink.websync.clientExtensions-leaveConference'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Leaves an IceLink conference.
  	 </div>
  	@function leaveConference
  	@param {fm.websync.client} client The WebSync client.
  	@param {fm.icelink.websync.leaveConferenceArgs} leaveConferenceArgs The arguments.
  	@return {fm.websync.client} The WebSync client.
  */


  clientExtensions.leaveConference = function() {
    var args2, args4, client, conferenceChannel, dynamicValue, e, leaveArgs, leaveConferenceArgs, state, _var0;
    client = arguments[0];
    leaveConferenceArgs = arguments[1];
    conferenceChannel = leaveConferenceArgs.getConferenceChannel();
    if (fm.stringExtensions.isNullOrEmpty(conferenceChannel)) {
      throw new Error("Conference channel cannot be null.");
    }
    dynamicValue = fm.global.tryCast(client.getDynamicValue(conferenceChannel), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 === null || typeof _var0 === 'undefined') {
      args2 = new fm.websync.chat.leaveSuccessArgs();
      args2.setClient(client);
      args2.setDynamicProperties(leaveConferenceArgs.getDynamicProperties());
      e = args2;
      e.copyExtensions(leaveConferenceArgs);
      state = new fm.icelink.websync.state();
      state.setClient(client);
      state.setConferenceChannel(conferenceChannel);
      state.setOnLeaveSuccess(leaveConferenceArgs.getOnSuccess());
      state.setOnLeaveFailure(leaveConferenceArgs.getOnFailure());
      state.setOnLeaveComplete(leaveConferenceArgs.getOnComplete());
      fm.icelink.websync.clientExtensions.raiseLeaveSuccess(state, e);
      return client;
    }
    dynamicValue.setUnlinkAllOnLeaveSuccess(leaveConferenceArgs.getUnlinkAllOnSuccess());
    dynamicValue.setOnLeaveSuccess(leaveConferenceArgs.getOnSuccess());
    dynamicValue.setOnLeaveFailure(leaveConferenceArgs.getOnFailure());
    dynamicValue.setOnLeaveComplete(leaveConferenceArgs.getOnComplete());
    args4 = new fm.websync.chat.leaveArgs([dynamicValue.getConferenceChannel(), dynamicValue.getInstanceChannel()], "fm.icelink.websync");
    args4.setRequestUrl(leaveConferenceArgs.getRequestUrl());
    args4.setSynchronous(leaveConferenceArgs.getSynchronous());
    args4.setOnSuccess(clientExtensions.onLeaveSuccess);
    args4.setOnFailure(clientExtensions.onLeaveFailure);
    args4.setDynamicProperties(leaveConferenceArgs.getDynamicProperties());
    leaveArgs = args4;
    leaveArgs.copyExtensions(leaveConferenceArgs);
    return fm.websync.chat.clientExtensions.leave(client, leaveArgs);
  };

  clientExtensions.onJoinFailure = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      dynamicValue.getClient().unsetDynamicValue(dynamicValue.getConferenceChannel());
      dynamicValue.getClient().unsetDynamicValue(dynamicValue.getInstanceChannel());
      dynamicValue.getConference().unsetDynamicValue(fm.icelink.websync.state.getConferenceKey());
      fm.icelink.websync.clientExtensions.raiseJoinFailure(dynamicValue, e);
      return dynamicValue.setConference(null);
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. WebSync could not join the conference channel, but without an extension state, a callback cannot be invoked.");
    }
  };

  clientExtensions.onJoinReceive = function() {
    var boundRecords, dynamicValue, e, offerAnswer, userId, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (e.getChannel() === dynamicValue.getConferenceChannel()) {
        return fm.icelink.websync.clientExtensions.raiseJoinReceive(dynamicValue, e);
      } else {
        if (e.getPublishingUser().getUserNickname() === "fm.icelink.websync") {
          if (e.getTag() === fm.icelink.websync.state.getOfferAnswerTag()) {
            userId = e.getPublishingUser().getUserId();
            boundRecords = e.getPublishingUser().getBoundRecords();
            offerAnswer = fm.icelink.offerAnswer.fromJson(e.getDataJson());
            if (offerAnswer.getIsOffer()) {
              if (fm.icelink.websync.clientExtensions.raiseShouldLink(dynamicValue, e, userId, boundRecords, false)) {
                return dynamicValue.getConference().receiveOfferAnswer(offerAnswer, userId, boundRecords);
              } else {
                return fm.log.debug("A remote WebSync client sent an offer, but an answer will not be created (denied by user code).");
              }
            } else {
              return dynamicValue.getConference().receiveOfferAnswer(offerAnswer, userId, boundRecords);
            }
          } else {
            if (e.getTag() === fm.icelink.websync.state.getCandidateTag()) {
              return dynamicValue.getConference().receiveCandidate(fm.icelink.candidate.fromJson(e.getDataJson()), e.getPublishingUser().getUserId());
            } else {
              return fm.icelink.websync.clientExtensions.raiseJoinReceive(dynamicValue, e);
            }
          }
        } else {
          return fm.icelink.websync.clientExtensions.raiseJoinReceive(dynamicValue, e);
        }
      }
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. WebSync received a message, but without an extension state, the message must be discarded.");
    }
  };

  clientExtensions.onJoinSuccess = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      dynamicValue.getConference().removeOnLinkOfferAnswer(fm.icelink.websync.clientExtensions._onLinkOfferAnswerEvent);
      dynamicValue.getConference().removeOnLinkCandidate(fm.icelink.websync.clientExtensions._onLinkCandidateEvent);
      dynamicValue.getConference().addOnLinkOfferAnswer(fm.icelink.websync.clientExtensions._onLinkOfferAnswerEvent);
      dynamicValue.getConference().addOnLinkCandidate(fm.icelink.websync.clientExtensions._onLinkCandidateEvent);
      return fm.icelink.websync.clientExtensions.raiseJoinSuccess(dynamicValue, e);
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. WebSync joined the conference channel, but without an extension state, a callback cannot be invoked.");
    }
  };

  clientExtensions.onLeaveFailure = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return fm.icelink.websync.clientExtensions.raiseLeaveFailure(dynamicValue, e);
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. WebSync could not leave the conference channel, but without an extension state, a callback cannot be invoked.");
    }
  };

  clientExtensions.onLeaveSuccess = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      dynamicValue.getConference().removeOnLinkCandidate(fm.icelink.websync.clientExtensions._onLinkCandidateEvent);
      dynamicValue.getConference().removeOnLinkOfferAnswer(fm.icelink.websync.clientExtensions._onLinkOfferAnswerEvent);
      dynamicValue.getClient().unsetDynamicValue(dynamicValue.getConferenceChannel());
      dynamicValue.getClient().unsetDynamicValue(dynamicValue.getInstanceChannel());
      dynamicValue.getConference().unsetDynamicValue(fm.icelink.websync.state.getConferenceKey());
      if (dynamicValue.getUnlinkAllOnLeaveSuccess()) {
        dynamicValue.getConference().unlinkAll("Local WebSync client left the conference.");
      }
      fm.icelink.websync.clientExtensions.raiseLeaveSuccess(dynamicValue, e);
      return dynamicValue.setConference(null);
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. WebSync left the conference channel, but without an extension state, a callback cannot be invoked.");
    }
  };

  clientExtensions.onLinkCandidate = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getConference().getDynamicValue(fm.icelink.websync.state.getConferenceKey()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return dynamicValue.publishCandidate(fm.icelink.websync.baseLinkArgsExtensions.getPeerClient(e).getInstanceId(), e.getCandidate());
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. IceLink generated a candidate, but without an extension state, the candidate must be discarded.");
    }
  };

  clientExtensions.onLinkOfferAnswer = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    dynamicValue = fm.global.tryCast(e.getConference().getDynamicValue(fm.icelink.websync.state.getConferenceKey()), fm.icelink.websync.state);
    _var0 = dynamicValue;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return dynamicValue.publishOfferAnswer(fm.icelink.websync.baseLinkArgsExtensions.getPeerClient(e).getInstanceId(), e.getOfferAnswer());
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. IceLink generated an offer/answer, but without an extension state, the offer/answer must be discarded.");
    }
  };

  clientExtensions.onUserJoin = function() {
    var boundRecords, dynamicValue, e, userId, _var0;
    e = arguments[0];
    if (e.getJoinedUser().getUserNickname() === "fm.icelink.websync") {
      dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
      _var0 = dynamicValue;
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        userId = e.getJoinedUser().getUserId();
        boundRecords = e.getSubscribedClient().getBoundRecords();
        if (fm.icelink.websync.clientExtensions.raiseShouldLink(dynamicValue, e, userId, boundRecords, true)) {
          return dynamicValue.getConference().link(userId, boundRecords, dynamicValue.getUnlinkExistingOnUserJoin());
        } else {
          return fm.log.debug("A remote WebSync client joined the conference, but an offer will not be created (denied by user code).");
        }
      }
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. A remote WebSync client joined the conference, but without an extension state, a link cannot be created.");
    }
  };

  clientExtensions.onUserLeave = function() {
    var dynamicValue, e, _var0;
    e = arguments[0];
    if (e.getLeftUser().getUserNickname() === "fm.icelink.websync") {
      dynamicValue = fm.global.tryCast(e.getClient().getDynamicValue(e.getChannel()), fm.icelink.websync.state);
      _var0 = dynamicValue;
      if ((_var0 !== null && typeof _var0 !== 'undefined') && dynamicValue.getUnlinkOnUserLeave()) {
        return dynamicValue.getConference().unlink(e.getLeftUser().getUserId(), "Remote WebSync client left the conference.");
      }
    } else {
      return fm.log.error("The IceLink/WebSync extension state was removed unexpectedly. A remote WebSync client left the conference, but without an extension state, the link cannot be dropped.");
    }
  };

  clientExtensions.raiseJoinFailure = function() {
    var args2, args3, args4, e, exception, onJoinComplete, onJoinFailure, p, state, _var0, _var1;
    state = arguments[0];
    e = arguments[1];
    onJoinFailure = state.getOnJoinFailure();
    _var0 = onJoinFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2 = new fm.icelink.websync.joinConferenceFailureArgs();
      args2.__conferenceChannel = state.getConferenceChannel();
      args2.__isRejoin = e.getIsRejoin();
      args2.setRetry(e.getRetry());
      args2.setClient(e.getClient());
      args2.setException(e.getException());
      args2.setTimestamp(e.getTimestamp());
      args2.setDynamicProperties(e.getDynamicProperties());
      p = args2;
      p.copyExtensions(e);
      try {
        onJoinFailure(p);
      } catch (exception1) {
        exception = exception1;
        if (!e.getClient().raiseUnhandledException(exception)) {
          fm.asyncException.asyncThrow(exception, "Client -> Join -> OnFailure");
        }
      } finally {

      }
      e.setRetry(p.getRetry());
    }
    onJoinComplete = state.getOnJoinComplete();
    _var1 = onJoinComplete;
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args4 = new fm.icelink.websync.joinConferenceCompleteArgs();
      args4.__isRejoin = e.getIsRejoin();
      args4.setClient(e.getClient());
      args4.setTimestamp(e.getTimestamp());
      args4.setDynamicProperties(e.getDynamicProperties());
      args3 = args4;
      args3.copyExtensions(e);
      try {
        return onJoinComplete(args3);
      } catch (exception2) {
        exception = exception2;
        if (!e.getClient().raiseUnhandledException(exception)) {
          return fm.asyncException.asyncThrow(exception, "Client -> Join -> OnComplete");
        }
      } finally {

      }
    }
  };

  clientExtensions.raiseJoinReceive = function() {
    var args2, e, onJoinReceive, p, state, _var0;
    state = arguments[0];
    e = arguments[1];
    onJoinReceive = state.getOnJoinReceive();
    _var0 = onJoinReceive;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2 = new fm.icelink.websync.joinConferenceReceiveArgs(e.getChannel(), e.getDataJson(), e.getDataBytes(), e.getConnectionType(), e.getReconnectAfter());
      args2.__publishingPeer = new fm.icelink.websync.peerClient(e.getPublishingUser().getUserId(), e.getPublishingClient().getBoundRecords());
      args2.setClient(e.getClient());
      args2.setTimestamp(e.getTimestamp());
      args2.setDynamicProperties(e.getDynamicProperties());
      p = args2;
      p.copyExtensions(e);
      return onJoinReceive(p);
    }
  };

  clientExtensions.raiseJoinSuccess = function() {
    var args2, args3, args4, e, exception, onJoinComplete, onJoinSuccess, p, state, _var0, _var1;
    state = arguments[0];
    e = arguments[1];
    onJoinSuccess = state.getOnJoinSuccess();
    _var0 = onJoinSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2 = new fm.icelink.websync.joinConferenceSuccessArgs();
      args2.__conferenceChannel = state.getConferenceChannel();
      args2.__users = e.getUsers();
      args2.__isRejoin = e.getIsRejoin();
      args2.setClient(e.getClient());
      args2.setTimestamp(e.getTimestamp());
      args2.setDynamicProperties(e.getDynamicProperties());
      p = args2;
      p.copyExtensions(e);
      try {
        onJoinSuccess(p);
      } catch (exception1) {
        exception = exception1;
        if (!e.getClient().raiseUnhandledException(exception)) {
          fm.asyncException.asyncThrow(exception, "Client -> Join -> OnSuccess");
        }
      } finally {

      }
    }
    onJoinComplete = state.getOnJoinComplete();
    _var1 = onJoinComplete;
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args4 = new fm.icelink.websync.joinConferenceCompleteArgs();
      args4.__isRejoin = e.getIsRejoin();
      args4.setClient(e.getClient());
      args4.setTimestamp(e.getTimestamp());
      args4.setDynamicProperties(e.getDynamicProperties());
      args3 = args4;
      args3.copyExtensions(e);
      try {
        return onJoinComplete(args3);
      } catch (exception2) {
        exception = exception2;
        if (!e.getClient().raiseUnhandledException(exception)) {
          return fm.asyncException.asyncThrow(exception, "Client -> Join -> OnComplete");
        }
      } finally {

      }
    }
  };

  clientExtensions.raiseLeaveFailure = function() {
    var args2, args3, args4, e, exception, onLeaveComplete, onLeaveFailure, p, state, _var0, _var1;
    state = arguments[0];
    e = arguments[1];
    onLeaveFailure = state.getOnLeaveFailure();
    _var0 = onLeaveFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2 = new fm.icelink.websync.leaveConferenceFailureArgs();
      args2.__conferenceChannel = state.getConferenceChannel();
      args2.setRetry(e.getRetry());
      args2.setClient(e.getClient());
      args2.setException(e.getException());
      args2.setTimestamp(e.getTimestamp());
      args2.setDynamicProperties(e.getDynamicProperties());
      p = args2;
      p.copyExtensions(e);
      try {
        onLeaveFailure(p);
      } catch (exception1) {
        exception = exception1;
        if (!e.getClient().raiseUnhandledException(exception)) {
          fm.asyncException.asyncThrow(exception, "Client -> Leave -> OnFailure");
        }
      } finally {

      }
      e.setRetry(p.getRetry());
    }
    onLeaveComplete = state.getOnLeaveComplete();
    _var1 = onLeaveComplete;
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args4 = new fm.icelink.websync.leaveConferenceCompleteArgs();
      args4.setClient(e.getClient());
      args4.setTimestamp(e.getTimestamp());
      args4.setDynamicProperties(e.getDynamicProperties());
      args3 = args4;
      args3.copyExtensions(e);
      try {
        return onLeaveComplete(args3);
      } catch (exception2) {
        exception = exception2;
        if (!e.getClient().raiseUnhandledException(exception)) {
          return fm.asyncException.asyncThrow(exception, "Client -> Leave -> OnComplete");
        }
      } finally {

      }
    }
  };

  clientExtensions.raiseLeaveSuccess = function() {
    var args2, args3, args4, e, exception, onLeaveComplete, onLeaveSuccess, p, state, _var0, _var1;
    state = arguments[0];
    e = arguments[1];
    onLeaveSuccess = state.getOnLeaveSuccess();
    _var0 = onLeaveSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2 = new fm.icelink.websync.leaveConferenceSuccessArgs();
      args2.__conferenceChannel = state.getConferenceChannel();
      args2.setClient(e.getClient());
      args2.setTimestamp(e.getTimestamp());
      args2.setDynamicProperties(e.getDynamicProperties());
      p = args2;
      p.copyExtensions(e);
      try {
        onLeaveSuccess(p);
      } catch (exception1) {
        exception = exception1;
        if (!e.getClient().raiseUnhandledException(exception)) {
          fm.asyncException.asyncThrow(exception, "Client -> Leave -> OnSuccess");
        }
      } finally {

      }
    }
    onLeaveComplete = state.getOnLeaveComplete();
    _var1 = onLeaveComplete;
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args4 = new fm.icelink.websync.leaveConferenceCompleteArgs();
      args4.setClient(e.getClient());
      args4.setTimestamp(e.getTimestamp());
      args4.setDynamicProperties(e.getDynamicProperties());
      args3 = args4;
      args3.copyExtensions(e);
      try {
        return onLeaveComplete(args3);
      } catch (exception2) {
        exception = exception2;
        if (!e.getClient().raiseUnhandledException(exception)) {
          return fm.asyncException.asyncThrow(exception, "Client -> Leave -> OnComplete");
        }
      } finally {

      }
    }
  };

  clientExtensions.raiseShouldLink = function() {
    var args, args2, boundRecords, e, initator, joinShouldLink, state, userId, _var0;
    state = arguments[0];
    e = arguments[1];
    userId = arguments[2];
    boundRecords = arguments[3];
    initator = arguments[4];
    joinShouldLink = state.getJoinShouldLink();
    _var0 = joinShouldLink;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2 = new fm.icelink.websync.shouldLinkArgs();
      args2.__joinedPeer = new fm.icelink.websync.peerClient(userId, boundRecords);
      args2.__initiator = initator;
      args2.setClient(e.getClient());
      args2.setTimestamp(e.getTimestamp());
      args2.setDynamicProperties(e.getDynamicProperties());
      args = args2;
      args.copyExtensions(e);
      return joinShouldLink(args);
    }
    return true;
  };

  /*<span id='method-fm.icelink.websync.clientExtensions-joinConference'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Joins an IceLink conference.
  	 </div>
  	@function joinConference
  	@param {fm.icelink.websync.joinConferenceArgs} joinConferenceArgs The arguments.
  	@return {fm.websync.client} The WebSync client.
  */


  fm.websync.client.prototype.joinConference = function() {
    var joinConferenceArgs;
    joinConferenceArgs = arguments[0];
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.icelink.websync.clientExtensions.joinConference.apply(this, arguments);
  };

  /*<span id='method-fm.icelink.websync.clientExtensions-leaveConference'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Leaves an IceLink conference.
  	 </div>
  	@function leaveConference
  	@param {fm.icelink.websync.leaveConferenceArgs} leaveConferenceArgs The arguments.
  	@return {fm.websync.client} The WebSync client.
  */


  fm.websync.client.prototype.leaveConference = function() {
    var leaveConferenceArgs;
    leaveConferenceArgs = arguments[0];
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.icelink.websync.clientExtensions.leaveConference.apply(this, arguments);
  };

  clientExtensions._onLinkOfferAnswerEvent = clientExtensions.onLinkOfferAnswer;

  clientExtensions._onLinkCandidateEvent = clientExtensions.onLinkCandidate;

  return clientExtensions;

}).call(this);


/*<span id='cls-fm.icelink.websync.baseLinkArgsExtensions'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.baseLinkArgsExtensions
 <div>
 Extension methods for <see cref="fm.icelink.baseLinkArgs">fm.icelink.baseLinkArgs</see> instances.
 </div>
*/

fm.icelink.websync.baseLinkArgsExtensions = (function() {

  function baseLinkArgsExtensions() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      baseLinkArgsExtensions.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /*<span id='method-fm.icelink.websync.baseLinkArgsExtensions-getPeerClient'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the remote WebSync peer.
  	 </div>
  	@function getPeerClient
  	@param {fm.icelink.baseLinkArgs} baseLinkArgs The base link arguments.
  	@return {fm.icelink.websync.peerClient} The remote WebSync peer.
  */


  baseLinkArgsExtensions.getPeerClient = function() {
    var baseLinkArgs;
    baseLinkArgs = arguments[0];
    return new fm.icelink.websync.peerClient(baseLinkArgs.getPeerId(), baseLinkArgs.getPeerState());
  };

  /*<span id='method-fm.icelink.websync.baseLinkArgsExtensions-getPeerClient'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the remote WebSync peer.
  	 </div>
  	@function getPeerClient
  	@return {fm.icelink.websync.peerClient} The remote WebSync peer.
  */


  fm.icelink.baseLinkArgs.prototype.getPeerClient = function() {
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.icelink.websync.baseLinkArgsExtensions.getPeerClient.apply(this, arguments);
  };

  return baseLinkArgsExtensions;

}).call(this);


/*<span id='cls-fm.icelink.websync.peerClient'>&nbsp;</span>
*/

/**
@class fm.icelink.websync.peerClient
 <div>
 Details about a remote WebSync instance.
 </div>

@extends fm.object
*/


fm.icelink.websync.peerClient = (function(_super) {

  __extends(peerClient, _super);

  peerClient.prototype._boundRecords = null;

  peerClient.prototype._instanceId = null;

  /*<span id='method-fm.icelink.websync.peerClient-fm.icelink.websync.peerClient'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Initializes a new instance of the <see cref="fm.icelink.websync.peerClient">fm.icelink.websync.peerClient</see> class.
  	 </div>
  	@function fm.icelink.websync.peerClient
  	@param {String} instanceId The WebSync instance ID.
  	@param {Object} boundRecords The WebSync bound records.
  	@return {}
  */


  function peerClient() {
    this.setInstanceId = __bind(this.setInstanceId, this);

    this.setBoundRecords = __bind(this.setBoundRecords, this);

    this.getInstanceId = __bind(this.getInstanceId, this);

    this.getBoundRecords = __bind(this.getBoundRecords, this);

    var boundRecords, instanceId;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      peerClient.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    instanceId = arguments[0];
    boundRecords = arguments[1];
    peerClient.__super__.constructor.call(this);
    this.setInstanceId(instanceId);
    this.setBoundRecords(boundRecords);
  }

  /*<span id='method-fm.icelink.websync.peerClient-getBoundRecords'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the WebSync bound records.
  	 </div>
  
  	@function getBoundRecords
  	@return {Object}
  */


  peerClient.prototype.getBoundRecords = function() {
    return this._boundRecords;
  };

  /*<span id='method-fm.icelink.websync.peerClient-getInstanceId'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Gets the WebSync instance ID.
  	 </div>
  
  	@function getInstanceId
  	@return {String}
  */


  peerClient.prototype.getInstanceId = function() {
    return this._instanceId;
  };

  /*<span id='method-fm.icelink.websync.peerClient-setBoundRecords'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the WebSync bound records.
  	 </div>
  
  	@function setBoundRecords
  	@param {Object} value
  	@return {void}
  */


  peerClient.prototype.setBoundRecords = function() {
    var value;
    value = arguments[0];
    return this._boundRecords = value;
  };

  /*<span id='method-fm.icelink.websync.peerClient-setInstanceId'>&nbsp;</span>
  */


  /**
  	 <div>
  	 Sets the WebSync instance ID.
  	 </div>
  
  	@function setInstanceId
  	@param {String} value
  	@return {void}
  */


  peerClient.prototype.setInstanceId = function() {
    var value;
    value = arguments[0];
    return this._instanceId = value;
  };

  return peerClient;

})(fm.object);


var methodName, _fn, _i, _len, _ref;

_ref = ['joinConference', 'leaveConference'];
_fn = function(methodName) {
  var method;
  method = fm.websync.client.prototype[methodName];
  return fm.websync.client.prototype[methodName] = function() {
    var obj;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      obj = arguments[0];
      return method.call(this, new fm.icelink.websync[methodName + 'Args'](obj));
    } else {
      return method.apply(this, arguments);
    }
  };
};
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  methodName = _ref[_i];
  _fn(methodName);
}


return fm.icelink.websync;
}));