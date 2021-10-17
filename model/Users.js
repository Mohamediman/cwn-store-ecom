const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide a password'],
        
        //==== works only on SAVE and CREATE 
        validate: {
            validator: function(el){
                return el === this.password;
            },
            message: 'Passwords must be the same:::'
        }
    }
});



/*================= MONGOOSE MIDDLEWARES ===================*/
//==== Hashing the password using pre-doc hook
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

//==== Use instance method to check if the password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}



const User = mongoose.model('User', userSchema);

module.exports = User;