const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passportInit = () => {
    passport.use(
        "local",
        new LocalStrategy(
            { usernameField: "email", passwordField: "password" },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ email: email });
                    console.log("User found", user);

                    if (!user) {
                        console.log("user not found");
                        return done(null, false, { message: "Incorrect credentials." });
                    }
                    const result = await user.comparePassword(password);
                    if (result) {
                        return done(null, user);
                    } else {
                        console.log("Incorrect password");
                        return done(null, false, { message: "Incorrect credentials." });
                    }
                } catch (e) {
                    console.error("Error during authentication:", e);
                    return done(e);
                }
            }
        )
    );

    passport.serializeUser(async function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        try {
            const user = await User.findById(id);
            if (!user) {
                console.error("User not found during deserialization");
                return done(new Error("user not found"));
            }
            return done(null, user);
        } catch (e) {
            console.error("Error during deserialization:", e);
            done(e);
        }
    });
};

module.exports = passportInit;