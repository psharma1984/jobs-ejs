require('express-async-errors');
require('dotenv').config();

const session = require('express-session');
const express = require('express');
const app = express();

const MongoDBStore = require('connect-mongodb-session')(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    uri: url,
    collection: 'sessions',
});
store.on('error', function (error) {
    console.log(error);
});

const sessionParams = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionParams.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParams));
app.use(require("connect-flash")());
app.set('view engine', 'ejs');
app.use(require('body-parser').urlencoded({ extended: true }));


app.get('/secretWord', (req, res) => {
    if (!req.session.secretWord) {
        req.session.secretWord = "panda";
    }
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");
    res.render("secretWord", { secretWord: req.session.secretWord });
})
app.post("/secretWord", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == 'P') {
        req.flash("error", "That word won't work!")
        req.flash("error", "You can't use words that start with p.");
    } else {
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "The secret word was changed.");
    }
    res.redirect("/secretWord");
});

app.use((req, res) => {
    res.status(404).send(`Sorry, ${req.url} not found!`);
})

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
})

const port = process.env.PORT || 3000;

const server = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        });
    } catch (err) {
        console.log(err);
    }
}

server();