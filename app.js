const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const upload = require('express-fileupload');
const flash = require('connect-flash');
const session = require('express-session');
const dishes = require('./routes/dishes');
const auth = require('./routes/auth');
const passport = require('passport');

//DATABASE

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/delivery', {useNewUrlParser: true});
mongoose.connection
    .once('open', () => console.log('MONGOOSE CONNECTED'))
    .on('error', (err) => {
        console.log(`the error is ${err}`)
    });

//STATIC FILES

app.use(express.static(path.join(__dirname, 'public')));

//EXPRESS-UPLOAD

app.use(upload());

//BODY PARSER

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//METHOD OVERRIDE

app.use(methodOverride('_method'));

//HANDLEBARS

const {select, formatDate} = require('./helpers/handlebars-helpers');
app.engine('handlebars', exphbs({defaultLayout: 'index', helpers: {select: select, formatDate: formatDate}}));
app.set('view engine', 'handlebars');

//SESSIONS

app.use(session({
    secret: 'dyakovlad',
    resave: true,
    saveUninitialized: true
}));

//PASSPORT

app.use(passport.initialize());
app.use(passport.session());

//FLASH

app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

//ROUTES

app.use('/dishes', dishes);
app.use('/auth', auth);

app.get('/', (req, res) => {
    res.render('dishes/index')
});

app.listen(8888, (result, err) => {
    if (err) throw err;
    console.log('SERVER ACTIVATED AT PORT 8888')
});