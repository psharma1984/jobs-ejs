require('express-async-errors');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const hostCsrf = require('host-csrf');


const app = express();
app.set('view engine', 'ejs');

//Security Packages
app.use(helmet());

app.use(xss());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

app.use(limiter);



//body parser
app.use(express.urlencoded({ extended: true }));

//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.SESSION_SECRET));

// Configure CSRF middleware
const csrf_development_mode = true;
if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1);
}
const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};
app.use(hostCsrf(csrf_options));

//session configuration
const session = require('express-session');
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


//passport initialization
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

//middlewares
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

//routes
app.get("/", (req, res) => {
    res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
const bookRouter = require('./routes/books');

app.use("/secretWord", auth, secretWordRouter);
app.use("/books", auth, bookRouter);

//error handling
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
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        });
    } catch (err) {
        console.log(err);
    }
}

server();