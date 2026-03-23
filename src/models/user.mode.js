import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({

    userName: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },


     email: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      
    },

     fullName: {
        type:String,
        lowercase: true,
        trim: true,
        index: true,
    },

    avatar: {
        type: String, //clouinary URL for the user's avatar image
        required: true,
        

    },

    coverImage: {
        type: String, //clouinary URL for the user's cover image
        required: true,
    },

    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],

    password: {
        type: String,
        required: [true, "Password is Required very much"]
    },

    refreshToken:{
        type:String,
    }

}, {
    timestamps: true,
})


userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        return next()
    }
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function (){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    },
    
    process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        }
    )
}

export const User = mongoose.model("User", userSchema)