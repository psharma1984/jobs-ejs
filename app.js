require('express-async-errors');
require('dotenv').config();

const session = require('express-session');
const express = require('express');
const app = express();
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const cookieParser = require('cookie-parser');
const hostCsrf = require('host-csrf');

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
app.use(express.json());

// Parse incoming requests with URL-encoded payloads
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
app.use(session(sessionParams));

passportInit();
app.use(passport.initialize());
app.use(passport.session());

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

app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));
app.get("/", (req, res) => {
    res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
app.set('view engine', 'ejs');

const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");

app.use("/secretWord", auth, secretWordRouter);

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