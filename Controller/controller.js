const mongoose = require("mongoose");
const DataBase = require("../Schema/model");
const RoomDB = require("../Schema/Room");
const DeviceDB = require("../Schema/Device");
const HomeDB = require("../Schema/Home")
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtSecret = 'FallbackSecretKey';
const nodemailer = require("nodemailer");
const fs = require("fs");
const { response } = require("express");

const Create_token = (id) => {
    return JWT.sign({ id }, jwtSecret)
}

const Verifyemail = async (email, Id, Name) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "smawari1000@gmail.com",
                pass: 'ukeivcvndhomfclr'
            }
        });
        const mailOption = {
            from: "smawari1000@gmail.com",
            to: email,
            subject: "For verification of Email",
            html: `<p>hi ${Name}, please click on <a href="http://localhost:8888/Heimatverse/verify?id=${Id}">verify</a></p>`
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log(info.response);
            }
        });
    } catch (err) {
        console.log(err);
    }
}

const reverify = async (req, res) => {
    const { Email } = req.body;
    try {
        if (Email) {
            const user = await DataBase.findOne({ Email });
            if (user) {
                Verifyemail(Email, user._id, user.Name);
                return res.status(200).json({ Message: "Check you Email and verify by clicking on that link" })
            }
            else {
                return res.status(404).json({ Message: "Email not found" })
            }
        }
        else {
            return res.status(400).json({ Message: "Email not provided" })
        }
    } catch (error) {

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

const setpassword = async (req, res) => {
    const { Email, password, newpassword, againnewpassword } = req.body;
    try {
        if (Email && password && newpassword && againnewpassword) {
            const user = await DataBase.findOne({ Email });
            if (user) {
                if (user.Verified) {
                    const passwordMatch = await bcrypt.compare(password, user.Password);
                    if (passwordMatch) {
                        if (newpassword === againnewpassword) {
                            const hashpassword = await bcrypt.hash(newpassword, 10);
                            user.Password = hashpassword;
                            await user.save();
                            return res.status(200).json({ message: "Password changed successfully" });
                        } else {
                            return res.status(400).json({ message: "New passwords do not match" });
                        }
                    } else {
                        return res.status(401).json({ message: "Incorrect password" });
                    }
                } else {
                    return res.status(401).json({ message: "User not verified" });
                }
            } else {
                return res.status(404).json({ message: "Email not found" });
            }
        } else {
            return res.status(400).json({ message: "Fill all data - Email, password, newpassword, againnewpassword" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


const Registration = async (req, res) => {
    const { Name, Password, PhoneNumber, Email, Address } = req.body;
    try {
        const exist = await DataBase.findOne({ Email });
        if (!exist) {
            const hashpassword = await bcrypt.hash(Password, 10);
            const new_user = new DataBase({ Name, Password: hashpassword, PhoneNumber, Email, Address });
            const user = await new_user.save();
            Verifyemail(Email, user._id, Name);
            return res.status(200).json({ message: "New User Created" });
        } else {
            return res.status(403).json({ message: "User already exists" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}



const Homecreate = async (req, res) => {
    const { Email, HomeName } = req.body;
    const Topic = Math.floor(100000000000 + Math.random() * 900000000000);
    try {
        if (Email && HomeName) {
            const user = await DataBase.findOne({ Email: Email });

            if (user) {
                if (user.Verified) {
                    const user_id = user._id;
                    const Home_owner = new HomeDB({ HomeName: req.body.HomeName, Home_owner: user_id, Topic: Topic });
                    const HomeID = Home_owner._id;
                    const update_user = await DataBase.findOneAndUpdate({ Email }, { $addToSet: { Home_Id: HomeID } });
                    await Home_owner.save();
                    return res.status(200).json({ message: "Home is created", HomeID });
                }
                else {
                    return res.status(401).json({ message: "user not Email verified" })
                }

            } else {
                return res.status(404).json({ message: "User not found" });
            }


        } else {
            return res.status(400).json({ message: "Provide Email or HomeName" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


const Home_user = async (req, res) => {
    const { Email, Home_Id } = req.body;
    try {
        if (Email && Home_Id) {
            const user = await DataBase.findOne({ Email: Email });
            if (user) {
                if (user.Verified) {
                    const user_id = user._id;

                    const updatedHome = await HomeDB.findOneAndUpdate({ _id: Home_Id }, { $addToSet: { User_ID: user_id } }, { new: true });

                    const updatedUser = await DataBase.findOneAndUpdate({ Email: Email }, { $addToSet: { Home_Id: Home_Id } }, { new: true });
                    return res.status(200).json({ message: "Home Joined", updatedHome, updatedUser });
                }
                else {
                    return res.status(401).json({ message: "user not Email verified" })
                }
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } else {
            return res.status(400).json({ message: "Provide Email and Home_Id" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}




const verify = async (req, res) => {
    try {
        const update = await DataBase.updateOne({ _id: req.query.id }, { $set: { Verified: true } });
        console.log(update);
        fs.readFile('verify.html', null, function (err, data) {
            if (err) {
                console.log(err);
                res.write("file not found");
            } else {
                res.write(data);
            }
            res.end();
        });
    } catch (err) {
        console.log(err.message);
    }
}





//add room if id not correct i got


const addRoom = async (req, res) => {
    const { Email, RoomName, Home_Id } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(Home_Id)) {
            return res.status(400).json({ message: "Invalid Home_Id" });
        }
        // Find the user
        const user = await DataBase.findOne({ Email: Email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Find the home
        const home = await HomeDB.findOne({ _id: Home_Id, Home_owner: user._id });
        if (!home) return res.status(404).json({ message: "User is not the owner of the Home or Home not found" });

        const Same_roomname = await RoomDB.findOne({ Room_Name: RoomName, Home_id: Home_Id })
        if (Same_roomname) {
            return res.status(404).json({ message: "Already Roomname" })
        }
        // Create room
        if (user.Verified) {
            const room = new RoomDB({ Room_Name: RoomName, Home_id: Home_Id });
            await room.save(); // Save room to database

<<<<<<< HEAD
            // Update home with new room
            home.Room_ID.push(room._id);
            await home.save();
            return res.status(200).json(room._id);
        }
        else {
            return res.status(401).json({ Message: "user Email Not verified" })
        }
=======
        // Update home with new room
        home.Room_ID.push(room._id);
        await home.save();

        return res.status(200).json(room._id);
>>>>>>> 8299e312b6b97f7d59e162961f489f6d804bdacd
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
}



const getUserData = async (req, res) => {
    const { Email } = req.body;

    try {
        const user = await DataBase.findOne({ Email })
            .populate({
                path: 'Home_Id',
                populate: {
                    path: 'Room_ID',
                    populate: {
                        path: 'Devices_id'
                    }
                }
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}




const addDevice = async (req, res) => {
    const { Email, Room_id, Home_Id, Device_name } = req.body;
    try {
        const user = await DataBase.findOne({ Email: Email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const home = await HomeDB.findOne({ _id: Home_Id, Home_owner: user._id, Room_ID: Room_id });
        if (!home) return res.status(404).json({ message: "User is not the owner of the Home or Home not found" });

        const Device_in_room = await DeviceDB.findOne({ Device_name: Device_name, Room_id: Room_id });
        if (Device_in_room) {
            return res.status(400).json({ Messaage: "room already have this named device" });
        }
        const device = new DeviceDB({ Device_name: Device_name, Room_id: Room_id });
        await device.save();

        const room = await RoomDB.findById(Room_id);
        if (!room) return res.status(404).json({ message: "Room not found" });
        if (user.Verified) {
            room.Devices_id.push(device._id);
            await room.save();
            return res.status(200).json({ message: "Device is added" });
        }
        else {
            return res.status(401).json({ Message: "user Email Not verified" })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = { Registration, Login, verify, Homecreate, addDevice, addRoom, Home_user, getUserData, reverify ,setpassword};

