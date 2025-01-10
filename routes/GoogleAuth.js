const { google } = require('googleapis');
const axios = require('axios');
const usermodel = require('../models/User');
const express = require('express');
const router=express.Router();
// Google OAuth2 Client Configuration
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;;
const redirectUri = "postsecret";
const oauth2client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

// Helper function to get user info
const getUserInfo = async (accessToken) => {
    const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
    );
    return userRes.data;
};

// Google Login Route Handler
const googleLogin = async (req, res) => {
    try {
        const { tokens } = req.query;

        if (!tokens || !tokens.access_token) {
            return res.status(400).send({ message: "Invalid tokens provided" });
        }

        const userInfo = await getUserInfo(tokens.access_token);
        const { email, name ,picture } = userInfo;
        console.log(userInfo);
        if (!email.endsWith('iiits.in')) {
            return res.status(400).send({ message: "Invalid email domain" });
        }
        const userExists = await usermodel.findOne({ email });
        if (userExists) {
            return res.status(200).send({
                message: "Email Already Exists",
                userId: userExists._id
            });
        }
        const newUser = new usermodel({
            name,
            email,
            profile:picture,
            registered_events:[]
        });
        await newUser.save();
        res.status(200).send({
            message: "Account Created Successfully",
            userId: newUser._id
        });
    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(500).send("An error occurred during Google login.");
    }
};

router.get('/', (req, res) => googleLogin(req, res));
module.exports = router;
