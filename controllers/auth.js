const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../model/Users');


//=== Signup a new user into the DB
exports.signup = async (req, res) => {
    console.log("req.body", req.body);
    try {
     const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    //===Create jwt and Sigin the user
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    //===Send the token and the user
    res.status(201).json({
        token
    })
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "Internal Server Error"
        })
        
    }
}

//Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if(!email || !password) {
            throw new Error('Email and Password are both required');
        }
       //get the email and password from the user input
    const user = await User.findOne({ email }).select('password');

    //Check if there is an account associated with the email
    if(!user || !( await user.correctPassword(req.body.password, user.password))){
        throw new Error("The email and password combination is not correct");
    } 

    //check if the password is correct
    const token = jwt.sign({id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN})

    //Sign in and send the token back
    res.status(201).json({
        token
    }) 
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}


//==== Authenticate A user for protected Routes
exports.auth = async (req, res, next) => {
    //-====Get the token from the header
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } 

    //=== get the Id the token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //=== Get the login user based on the Id from the token
    const user = await User.findById(decoded.id);
    
    if(!user) {
        throw new Error('the User belonging to this Token no longer exist');
    }
    
    //===Asign the id from the token to req.user for verification in the routes to follow
    req.user = user;

    next();

}



//==== GEt the login user
exports.getLoginUser = async(req, res) => {
    const user = req.user;
    res.status(200).json({
        user
    })
}