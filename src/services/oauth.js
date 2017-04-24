// @flow
/**
 * Module dependencies.
 */
var oauthorize = require('oauthorize')
    , passport = require('passport')
    , login = require('connect-ensure-login')
    , db = require('./oauth-db')
    , utils = require('./oauth-utils');

var debug = require('./debug')('oauth');
var log = require('./log');
// create OAuth server
var server = oauthorize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to the user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => {
    return done(null, client.id);
});

server.deserializeClient((id, done) => {
    db.clients.find(id, (err, client) => {
        if (err) { return done(err); }
        return done(null, client);
    });
});


/**
 * Token endpoints
 *
 * This following endpoints are used by a client to obtain tokens.  First, a
 * temporary request token is used, which will be authorized by the user.  Once
 * authorized, it can be exchanged for a permanent access token.
 */

// Request token endpoint
//
// `requestToken` middleware accepts an `issue` callback which is responsible
// for issuing a request token and corresponding secret.  This token serves as
// a temporary credential, and is used when requesting authorization from the
// user.  The request token is bound to the client to which it is issued.
//
// This example is kept intentionally simple, and may not represent best
// security practices.  Implementers are encouraged to understand the
// intricacies of the OAuth protocol and the security considerations regarding
// request tokens.  In particular, the token should have a limited lifetime.
// Furthermore, it may be dificult or impossible to guarantee the
// confidentiality of client credentials, in which case it is advisable
// to validate the `callbackURL` against a registered value.

exports.requestToken = [
    passport.authenticate('consumer', {session: false}),
    server.requestToken((client, callbackURL, done) => {
        const token: string = utils.uid(8);
        const secret: string = utils.uid(32);

        //callbackURL from the OAuth system is ignored because we use the one saved with the client info
        //in order to be on the same page with OSM regarding OAuth 1.0 vs 1.0a
        //see: http://wiki.openstreetmap.org/wiki/OAuth/10a
        db.requestTokens.save(token, secret, client.id, client.callbackURL, (err) => {
            if (err) { return done(err); }
            return done(null, token, secret);
        });
    }),
    server.errorHandler((err: any) => {
        log.error(err);
    })
];

// Access token endpoint
//
// `accessToken` middleware requires two callbacks: a `verify` callback and an
// `issue` callback.
//
// The `verify` callback is responsible for determining whether or not the
// `verifier` is valid for the given `requestToken`.  This step is necessary to
// ensure that the application that requested authorization is the same one
// exchanging the request token for an access token.
//
// The `issue` callback is responsible for exhanging `requestToken` for an
// access token and corresponding secret, which will be issued to the client.
// This token will be used by the client to make requests on behalf of the user.
//
// Note that both callbacks accept an `info` argument.  This value of this
// argument is populated by the `ConsumerStrategy` token callback.  Typically,
// it will contain details encoded by the `requestToken` including the client it
// was issued to, and the user who authorized it, and the verifier.  Because of
// this, it is often unnecessary to query the database for further information
// about `requestToken`.

exports.accessToken = [
    passport.authenticate('consumer', {session: true}),
    server.accessToken(
        (requestToken, verifier, info, done) => {
            //disabled since OSM (and the iD editor) have not been updated to use OAuth 1.0a
            //see: http://wiki.openstreetmap.org/wiki/OAuth/10a
            //if (verifier != info.verifier) { return done(null, false); }
            return done(null, true);
        },
        (client, requestToken, info, done) => {
            if (!info.approved) { return done(null, false); }
            if (client.id !== info.clientID) { return done(null, false); }

            const token: string = utils.uid(16);
            const secret: string = utils.uid(64);

            db.accessTokens.save(token, secret, info.userID, info.clientID, (err) => {
                if (err) { return done(err); }
                return done(null, token, secret);
            });
        }
    ),
    server.errorHandler()
];


/**
 * User authorization endpoints
 *
 * This following endpoints are used to interact with the user and obtain their
 * authorization.  After ensuring that a user is logged in, a form will be
 * rendered prompting the user to allow or deny the request.  That form is
 * submitted to a decision endpoint, which process the form and redirects the
 * user back to the client application.
 */

// user authorization endpoint
//
// `userAuthorization` middleware accepts a `validate` callback which is
// responsible for retrieving details about a previously issued request token.
// Once retreived, the `done` callback must be invoked with the client to which
// the request token was issued, as well as the callback URL to which the user
// will be redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.

exports.userAuthorization = [
    login.ensureLoggedIn(),
    server.userAuthorization((requestToken, done) => {
        db.requestTokens.find(requestToken, (err, token) => {
            if (err) { return done(err); }
            db.clients.find(token.clientID, (err, client) => {
                if (err) { return done(err); }
                return done(null, client, token.callbackURL);
            });
        });
    }),
    function(req: any, res: any){
        res.render('approvedialog', {title: 'Approve Access', props: {transactionID: req.oauth.transactionID, user: req.user.display_name, client: req.oauth.client.name}, req});
    }
];

// user decision endpoint
//
// `userDecision` middleware processes a user's decision to allow or deny access
// requested by a client application.  It accepts an `issue` callback which is
// responsible for issuing a verifier, which is used to verify the subsequent
// request by the client to exchange the request token for an access token.
//
// The `issue` callback accepts as arguments a `requestToken`, `user`, and
// `res`.  `user` is the authenticated user that approved the request.  `res` is
// the response to the OAuth transaction, which may include details such as
// scope of access, duration of access, and any other parameters parsed by the
// application.  These details are encoded into the token, to be used when
// issuing the permanent access token.

exports.userDecision = [
    login.ensureLoggedIn(),
    server.userDecision((requestToken, user, res, done) => {
        var verifier = utils.uid(8);
        debug('processing user decision, requestToken:' + requestToken);
        db.requestTokens.approve(requestToken, user.id, verifier, (err) => {
            if (err != null) {
              log.error(err);
              return done(err);
            }
            return done(null, verifier);
        });
    })
];
