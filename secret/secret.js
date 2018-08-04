module.exports = {
    auth: {
        user: 'lookat018@gmail.com',
        pass: ''
    },
    
    facebook: {
        clientID: '324124764807177', //Facebook login app id
        clientSecret: 'b6d6b39f6e2b20d7bd7c6b28c0816978', //Facebook login secret key
        profileFields: ['email', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    }
}