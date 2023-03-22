require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const auth = require("./middleware/auth")

app.use(express.json());

// Logic goes here
app.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        const userExists = await User.find({ email });

        if (userExists.email) {
            console.log('exists');
            return res.status(409).send("User already exists. Please Login");
        }

        let encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        const token = jwt.sign(
            { user_id: newUser._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          // save user token
          newUser.token = token;

          res.status(201).json(newUser);
    } 
    catch (err) {
        console.log(err);
    }
});

app.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send("Bro, we need those credentials");
        }

        const user = await User.findOne({ email });

        if (user.email && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            user.token = token;
    
            res.status(200).json(user);
        }
        else {
            res.status(400).send("These credentials are not it");
        }
    }
    catch (err) {
        console.log(err);
    }
});



module.exports = app;