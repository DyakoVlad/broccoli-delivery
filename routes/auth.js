const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');

// NODEMAILER

let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
        user: 'broccoli.delivery@gmail.com',
        pass: 'password'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// PASSPORT

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({email: email}).then(user => {
        if (!user) return done(null, false, {message: 'Incorrect email or password'});

        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) throw err;

            if (matched) {
                return done(null, user)
            }
            else {
                return done(null, false, {message: 'Incorrect email or password'})
            }
        })
    })
}));

passport.use(new FacebookStrategy({
        clientID: 2117033465212929,
        clientSecret: 'ea3bc550d20d2776ace85ca3903945d2',
        callbackURL: "http://localhost:8888/auth/login_facebook/callback",
        profileFields: ['id', 'emails', 'name']
    },
    function (accessToken, refreshToken, params, profile, done) {
        User.findOne({facebookID: profile.id}).then(user => {
            if (user) {
                return done(null, user);
            }
            else {
                newUser = new User({
                        email: profile.emails[0].value,
                        facebookID: profile.id,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        isVerified: true
                    }
                );
                newUser.save().then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {message: 'Unexpected error'})
                    }
                })
            }
        });
    }
));

passport.use(new VKontakteStrategy(
    {
        clientID: 6685541,
        clientSecret: 'Y93R44B1hSJgueNPgDM8',
        callbackURL: "http://localhost:8888/auth/login_vk/callback",
        profileFields: ['email', 'city', 'bdate']
    },
    (accessToken, refreshToken, params, profile, done) => {
        User.findOne({vkID: profile.id}).then(user => {
            if (user) {
                return done(null, user);
            }
            else {
                newUser = new User({
                        email: params.email,
                        vkID: profile.id,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        isVerified: true
                    }
                );
                newUser.save().then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {message: 'Unexpected error'})
                    }
                })
            }
        });
    }
));

passport.use(new GoogleStrategy({
        clientID: '396530545011-8vdtdu8e2469h9slt8uj11osub0o817i.apps.googleusercontent.com',
        clientSecret: '6LgwAIlIoZe-i7BPwIrn-38c',
        callbackURL: "http://localhost:8888/auth/login_google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({googleID: profile.id}).then(user => {
            if (user) {
                return done(null, user);
            }
            else {
                newUser = new User({
                        email: profile.emails [0].value,
                        googleID: profile.id,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        isVerified: true
                    }
                );
                newUser.save().then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {message: 'Unexpected error'})
                    }
                })
            }
        });
    }
));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

// ROUTES

router.get('/login', (req, res) => {
    res.render('auth/login')
});

router.get('/login_vk', passport.authenticate('vkontakte', {scope: ['email']}));

router.get('/login_vk/callback',
    passport.authenticate('vkontakte', {
        successRedirect: '/dishes',
        failureRedirect: '/auth/login'
    })
);

router.get('/login_facebook',
    passport.authenticate('facebook'));

router.get('/login_facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/auth/login', scope: ['email']}),
    function (req, res) {
        res.redirect('/dishes');
    });

router.get('/login_google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login_google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    function(req, res) {
        res.redirect('/dishes');
    });

router.post('/login', (req, res, next) => {
    User.deleteMany({isVerified: false}).then(userDeleted => {
    });
    passport.authenticate('local', {
        successRedirect: '/dishes',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    User.deleteMany({isVerified: false}).then(userDeleted => {
    });
    req.logOut();
    res.redirect('/dishes')
});

router.get('/register', (req, res) => {
    User.deleteMany({isVerified: false}).then(userDeleted => {
    });
    res.render('auth/register')
});

router.get('/test', (req, res) => {
    res.json(req.user);
});

router.post('/register', (req, res) => {
    let errors = [];

    if (!req.body.email) {
        errors.push({message: 'You must enter an email'})
    }
    if (!req.body.firstName) {
        errors.push({message: 'You must enter a first name'})
    }
    if (!req.body.lastName) {
        errors.push({message: 'You must enter a last name'})
    }
    if (!req.body.password) {
        errors.push({message: 'You must enter a password'})
    }
    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({message: 'You must enter similar password'})
    }
    if (req.body.password.length < 8) {
        errors.push({message: "Password can't be less then 8 simbols"})
    }

    if (errors.length > 0) {
        res.render('auth/register', {
            message: errors,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
    }
    else {
        User.findOne({email: req.body.email}, (err, user) => {
            if (!user) {
                const newUser = new User();
                newUser.email = req.body.email;
                newUser.firstName = req.body.firstName;
                newUser.lastName = req.body.lastName;
                newUser.password = req.body.password;

                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;

                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;

                        newUser.password = hash;
                        newUser.save().then(userSaved => {
                            res.redirect(`/auth/code/${userSaved.id}`)
                        });
                    })
                });
            }
            else {
                req.flash('error_message', 'This email is already exists');
                res.redirect('/auth/register')
            }
        });
    }
});

router.get('/code/:id', (req, res) => {
    User.findOne({_id: req.params.id}).then(user => {
        let code = String(Math.round(Math.random() * (999999 - 100000) + 100000));
        transporter.sendMail({
            from: 'broccoli.delivery@gmail.com',
            to: user.email,
            subject: 'Verify code from Broccoli Delivery',
            text: `You verify code is ${code}`
        }, (err, info) => {
            if (err) {
                console.log(err);
            }
        });
        user.verifyCode = code;
        user.save().then(userSaved => {
            res.render('auth/code', {id: req.params.id, attempts: 3})
        });
    })
});

let attempts = 3;
router.post('/code/:id/', (req, res) => {
    User.findOne({_id: req.params.id}).then(user => {
        if (user.verifyCode === req.body.code) {
            user.isVerified = true;
            user.verifyCode = 0;
            user.save().then(userSaved => {
                req.flash('success_message', 'You have successfully registered. Please login.');
                res.redirect('/auth/login');
            })
        }
        else {
            if (attempts > 1) {
                attempts = attempts - 1;
                res.render('auth/code', {code: req.params.code, id: req.params.id, attempts: attempts})
            }
            else {
                attempts = 3;
                req.flash('error_message', 'You ran out of attempts. Try again.');
                res.redirect('/auth/register');
            }
        }
    });
});

module.exports = router;