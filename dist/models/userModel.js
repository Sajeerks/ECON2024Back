import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "please enter ID"]
    },
    photo: {
        type: String,
        required: [true, "please enter photo"]
    },
    name: {
        type: String,
        required: [true, "please enter  the name"]
    },
    email: {
        type: String,
        unique: [true, "email already exists"],
        required: [true, "please enter  the name"],
        validate: validator.default.isEmail
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "please enter  the gender"]
    },
    dob: {
        type: Date,
        required: [true, "please enter  the DOB"]
    },
}, {
    timestamps: true
});
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});
export const userModel = mongoose.model("userModel", userSchema);
