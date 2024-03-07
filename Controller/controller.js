const mongoose = require("mongoose");
const DataBase = require("../Schema/model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtSecret = 'FallbackSecretKey';

const Create_token = (id) => {
    return JWT.sign({ id }, jwtSecret)
}

const Registration = async (req, res) => {
    const { Name, Password, PhoneNumber, Email } = req.body;
    try {
        const exist = await DataBase.findOne({ Email: req.body.Email });
        if (!exist) {
            const hashpassword = await bcrypt.hash(req.body.Password, 10);
            const new_user = new DataBase({ Name, Password: hashpassword, PhoneNumber, Email })
            await new_user.save();
            return res.status(200).json({ messsage: "New User Created" });
        } else {
            return res.status(403).json({ message: "User already exist" });
        }

    }
    catch (error) {
        return res.status(500).json(error);
    }
}



const Login = async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const exist = await DataBase.findOne({ Email });
        if (exist) {
            const passwordMatch = await bcrypt.compare(Password, exist.Password);
            if (passwordMatch) {
                let token = Create_token(exist._id);
                res.cookie("Cookie", token, { httpOnly: true, maxAge: 999999 });
                return res.status(200).json({
                    "status": "success",
                    "message": "Login successful",
                    "data": {
                        "Name": exist.Name,
                        "PhoneNumber": exist.PhoneNumber
                    }
                });
            } else {
                return res.status(400).json({ message: "Password is incorrect" });
            }
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(400).json(error);
    }
}; 


const AddTopic = async (req, res) => {
    const { Topic, Email } = req.body;
    try {
        // Validate Topic and Email before proceeding
        if (!Topic || !Email) {
            return res.status(400).json({ message: "Invalid data provided" });
        }

        const user = await DataBase.findOne({ Email: Email }).exec();
        if (user) {
            await DataBase.findOneAndUpdate({ _id: user._id }, { $addToSet: { Topics: Topic } });
            return res.status(200).json({ message: "Topic is saved" });
        } else {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json(error);
    }
}

const data = async (req, res) => {
    try {
        const data = await DataBase.find().select('-Password'); // Excluding the 'Password' field
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
}



const Device = async (req, res) => {
    const { Email, Device_Name, Room_ID } = req.body;
    try {
        const Device = {
            Device_Name: Device_Name,
            Room_ID: Room_ID
        };

        const user = await DataBase.findOne({ Email: Email });
        if (user) {
            let update = await DataBase.findOneAndUpdate({ _id: user._id }, { $push: { Device: [Device] } });
            return res.status(200).json({ message: "device added" });
        }
        else{
            return res.status(400).json({message:"provide Valid Email"})
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
}

module.exports = { Registration, Login, data, Device ,AddTopic};