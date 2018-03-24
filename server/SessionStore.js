const frappe = require('frappejs');
const Store = require('express-session/session/store');
const Database = require('frappejs/backends/database');

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) };

module.exports = class SessionStore extends Store {
    constructor(){
        super();
    }
    // Required : get(sid, callback), destroy(sid, callback), set(sid, session, callback)
    async get(sid, callback){
        console.log("SessionStore#get", sid);
        let session = await frappe.db.get("Session", sid);
        console.log(typeof session, "Session#session", session.session);
        if(typeof session.session == String){
            callback(null, JSON.parse(session.session));
        } else if(typeof session.session == Object){
            callback(null, session.session);
        } else {
            callback(null, null);
        }
    }

    async destroy(sid, callback){
        console.log("SessionStore#destroy", sid);
        this.deleteSession(sid);
        callback && defer(callback);
    }

    set(sid, session, callback){
        console.log("SessionStore#set", sid);
        this.clearAll();
        const now = new Date()
        const expiration = new Date(now.setHours(now.getHours() + 1));
        session.cookie.expires = expiration;
        session.cookie.originalMaxAge = 1800;
        frappe.db.insert("Session", {
            name: sid,
            session: JSON.stringify(session)
        });
        callback && defer(callback);
    }

    // Recommended : touch(sid, session, callback)
    async touch(sid, session, callback){
        console.log("SessionStore#touch", sid);
        var currentSession = await this.getSession(sid);
        console.log("currentSession", currentSession);
        if (currentSession) {
            // update expiration
            currentSession.cookie = session.cookie;
            frappe.db.update('Session', {
                name: sid,
                session: JSON.stringify(currentSession)
            });
        }

        callback && defer(callback);
    }

    // Optional : all(callback), clear(callback), length(callback)
    all(callback){
        console.log("SessionStore#all");
        const sessionIds = [];
        var sessionList = frappe.db.getAll('Session');
        var sessions = {};
        for (let i = 0; i < sessionList.length; i++) {
            sessionIds.push(sessionList[i].name);
        }
        for (var i = 0; i < sessionIds.length; i++) {
          var sessionId = sessionIds[i];
          var session = this.getSession(sessionId);

          if (session) {
            sessions[sessionId] = session;
          }
        }

        callback && defer(callback, null, sessions);
    }

    clear(callback){
        console.log("SessionStore#clear");
        this.clearAll();
        callback && defer(callback);
    }

    length(callback){
        console.log("SessionStore#length");
        this.all(function (err, sessions) {
            if (err) return callback(err);
            callback(null, Object.keys(sessions).length);
        });
    }

    async getSession(sessionId) {
        console.log("SessionStore#getSession", sessionId);
        let session = await frappe.getDoc('Session', sessionId);
        var sess = session.session;
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
          this.deleteSession(sessionId);
          return;
        }

        return sess;
      }

    async clearAll(){
        console.log("SessionStore#clearAll");
        let sessionList = await frappe.db.getAll({doctype:"Session"});
        for (let i = 0; i < sessionList.length; i++) {
            const session = sessionList[i];
            console.log(session.name);
            const sess = await frappe.getDoc('Session', session.name);
            sess.delete();
        }
    }

    async deleteSession(sid){
        const sess = await frappe.getDoc('Session', sid);
        sess.delete();
    }

}
