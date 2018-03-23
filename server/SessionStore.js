import { EventEmitter } from 'events';

// const EventEmitter = require('events').EventEmitter;
const Store = require('express-session/session/store');
/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) };

module.exports = class SessionStore extends Store { // extends EventEmitter {
    constructor(){
        super();
        this.sessions = {};
    }
    // Required : get(sid, callback), destroy(sid, callback), set(sid, session, callback)
    get(sid, callback){
        defer(callback, null, this.getSession(sid));
    }

    destroy(sid, callback){
        delete this.sessions[sid];
        callback && defer(callback);
    }

    set(sid, session, callback){
        this.sessions[sid] = JSON.stringify(session);
        callback && defer(callback);
    }

    // Recommended : touch(sid, session, callback)
    touch(sid, session, callback){
        var currentSession = this.getSession(sid);

        if (currentSession) {
            // update expiration
            currentSession.cookie = session.cookie;
            this.sessions[sid] = JSON.stringify(currentSession);
        }

        callback && defer(callback);
    }

    // Optional : all(callback), clear(callback), length(callback)
    all(callback){
        var sessionIds = Object.keys(this.sessions);
        var sessions = Object.create(null);

        for (var i = 0; i < sessionIds.length; i++) {
          var sessionId = sessionIds[i];
          var session = this.getSession.call(this, sessionId);

          if (session) {
            sessions[sessionId] = session;
          }
        }

        callback && defer(callback, null, sessions);
    }

    clear(callback){
        this.sessions = Object.create(null);
        callback && defer(callback);
    }

    length(callback){
        this.all(function (err, sessions) {
            if (err) return callback(err);
            callback(null, Object.keys(sessions).length);
        });
    }

    getSession(sessionId) {
        var sess = this.sessions[sessionId];
        if (!sess) {
          return;
        }

        // parse
        sess = JSON.parse(sess);

        var expires = typeof sess.cookie.expires === 'string'
          ? new Date(sess.cookie.expires)
          : sess.cookie.expires;

        // destroy expired session
        if (expires && expires <= Date.now()) {
          delete this.sessions[sessionId];
          return;
        }

        return sess;
      }
}
