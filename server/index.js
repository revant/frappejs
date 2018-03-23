const backends = {};
backends.sqlite = require('frappejs/backends/sqlite');
backends.mysql = require('frappejs/backends/mysql');

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const frappe = require('frappejs');
const restAPI = require('./restAPI');
const frappeModels = require('frappejs/models');
const common = require('frappejs/common');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const session = require('express-session');
const path = require('path');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

module.exports = {
    async start({backend, connectionParams, models}) {
        await this.init(app);

        if (models) {
            frappe.registerModels(models, 'server');
        }

        // database
        await this.initDb({backend:backend, connectionParams:connectionParams});

        // app
        const nunjucksEnv = nunjucks.configure(path.resolve(__dirname, 'views'), {
            express: app
        });

        nunjucksEnv.addFilter('log', console.log);

        app.use(cookieParser());
        let sess = {
            // store: {}, // set store
            secret: 'cats',
            resave: false,
            saveUninitialized: true,
            cookie : {}
        };

        if (app.get('env') === 'production') {
            app.set('trust proxy', 1) // trust first proxy
            sess.cookie.secure = true // serve secure cookies
        }

        app.use(session(sess));

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.engine('html', nunjucks.render);
        app.set('view engine', 'html');
        app.set('view options', { layout: true });

        app.get('/login', function (req, res, next) {
            res.render('login');
        });

        app.post('/login', function (req, res, next) {

            // you might like to do a database look-up or something more scalable here
            if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
                req.session.authenticated = true;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }

        });

        app.get('/logout', function (req, res, next) {
            delete req.session.authenticated;
            res.redirect('/');
        });

        app.use(this.checkAuth);


        // socketio
        io.on('connection', function (socket) {
            frappe.db.bindSocketServer(socket);
        });
        // routes
        restAPI.setup(app);

        // listen
        frappe.app = app;
        frappe.server = server;

        server.listen(frappe.config.port);
    },

    async init() {
        frappe.isServer = true;
        await frappe.init();
        frappe.registerModels(frappeModels, 'server');
        frappe.registerLibs(common);
        await frappe.login();
    },

    async initDb({backend, connectionParams}) {
        frappe.db = await new backends[backend](connectionParams);
        await frappe.db.connect();
        await frappe.db.migrate();
    },

    checkAuth (req, res, next) {
        console.log('checkAuth ' + req.url);
        // don't serve /secure to those not logged in
        // you should add to this list, for each and every secure url
        if (req.url === '/' && (!req.session || !req.session.authenticated)) {
            res.redirect('/login');
            return;
        } else {
            app.use(express.static('./'));
        }

        next();
    }
}
