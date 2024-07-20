const mongoose = require("mongoose");
const DataBase = require("../Schema/model1");
const RoomDB = require("../Schema/Room");
const DeviceDB = require("../Schema/Device");
const NodeDB = require("../Schema/Node.js");
const HomeDB = require("../Schema/Home")
const JoinModel = require("../Schema/JoinModel.js")
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtSecret = 'FallbackSecretKey';
const Rtoken = "refreshtokenkey";
const nodemailer = require("nodemailer");
const fs = require("fs");
const { response } = require("express");

const Create_token = (id) => {
    return JWT.sign({ id }, jwtSecret)
}
const refresh_token = (id) => {
    return JWT.sign({ id }, Rtoken)
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

const kickuser = async (req, res) => {
    const { home_id, user_id, target_id } = req.body;
    try {
        // Find the home
        const home = await HomeDB.findById(home_id);

        // Check if the home exists
        if (!home) {
            return res.status(404).json({ error: "Home not found" });
        }

        // Check if the user making the request is the owner of the home
        if (home.Home_owner.toString() !== user_id) {
            return res.status(401).json({ error: "User is not the owner of the home" });
        }

        // Check if the target user exists in the home's User_ID array
        const targetUserIndex = home.User_ID.indexOf(target_id);
        if (targetUserIndex === -1) {
            return res.status(404).json({ error: "Target user not found in the home" });
        }

        // Remove the target user from the User_ID array
        home.User_ID.splice(targetUserIndex, 1);
        
        // Save the updated home
        await home.save();

        return res.status(200).json({ message: "User removed successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}



const deleteHome = async (req, res) => {
    const { home_id, user_id } = req.body;
    try {
        const home = await HomeDB.findById(home_id);
        if (!home) {
            return res.status(404).json({ error: "HOME NOT FOUND" });
        }

        // Check if the user is the owner of the home
        if  (home.Home_owner.toString() !== user_id) {
            return res.status(401).json({ error: "USER NOT OWNER OF HOME" });
        }

        // Fetch users associated with the home
        const users = await DataBase.find({ _id: { $in: home.User_ID } });
        console.log("Users associated with the home:", users);

        // Remove the home_id from each user
        const userUpdatePromises = users.map(async (user) => {
            await DataBase.findByIdAndUpdate(user._id, { Home_Id: null });
        });
        await Promise.all(userUpdatePromises);  

        // Delete associated rooms
        const roomDeletionPromises = home.Room_ID.map(async (roomId) => {
            await RoomDB.findByIdAndDelete(roomId);
        });
        await Promise.all(roomDeletionPromises);

        // Finally, delete the home
        await HomeDB.findByIdAndDelete(home_id);

        return res.status(200).json({ message: "Home deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



const Login = async (req, res) => {
    const { Email, Password } = req.body;
    try {
        //find user in database
        const exist = await DataBase.findOne({ Email });
        if (exist) {
            //match passwords
            const passwordMatch = await bcrypt.compare(Password, exist.Password);
            if (passwordMatch) {
                //create JWT token
                const token = Create_token(exist._id);
                //create Refresh token
                const refreshtoken = refresh_token(exist._id);
                exist.Refreshtoken = refreshtoken;
                await exist.save(); // Save the updated user with refresh token

                //COOKIE
                res.cookie('Refresh', refreshtoken, { httpOnly: true, sameSite: 'strict' })
                   .cookie('JWTToken', token, { httpOnly: true, sameSite: 'strict' });
                
                return res.status(200).json({
                    status: "success",
                    pass:exist.Password,
                    id:exist._id,
                    message: "Login successful",
                    data: {
                        Name: exist.Name,
                        PhoneNumber: exist.PhoneNumber
                    }
                });
            } else {
                return res.status(400).json({ message: "Password is incorrect" });
            }
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


const Refresh_token = async (req, res) => {
    try {
        let refreshToken;
        if (req.cookies && req.cookies.refreshToken) {
            refreshToken = req.cookies.refreshToken;
        } else if (req.body && req.body.Refresh) {
            refreshToken = req.body.Refresh;
        } else {
            console.log("Refresh token not received");
            return res.status(401).json({ message: "Refresh token not received" });
        }

        const decodedToken = JWT.verify(refreshToken, Rtoken);
        
        const user = await DataBase.findById(decodedToken?.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        if (refreshToken !== user.Refreshtoken) {
            return res.status(401).json({ message: "Refresh token does not match" });
        }
        
        const accessToken = Create_token(user._id);
        const newRefreshToken = refresh_token(user._id);
        
        user.Refreshtoken = newRefreshToken;
        await user.save();
        
        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error(error);
        return res.status(400).json(error);
    }
};



const forgotpassword = async (req, res) => {
    const { Email, password, newpassword, againnewpassword } = req.body;
    try {
        if (Email && password && newpassword && againnewpassword) {
            const user = await DataBase.findOne({ Email });
            if (user) {
                // if (user.Verified) {
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
            // Verifyemail(Email, user._id, Name);
            return res.status(200).json({
                password: hashpassword,
                userID: user._id
            });
        } else {
            return res.status(403).json({ message: "User already exists" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}




const Homecreate = async (req, res) => {
    const { Email, HomeName } = req.body;
    //Creating Topic
    const Topic = (Math.floor(100000000000 + Math.random() * 900000000000)).toString();
    
    //Check is Email and HomeName is provide or not
    if (!Email || !HomeName) {
        return res.status(400).json({ message: "Provide Email or HomeName" });
    }

    try {
        //Find user in database
        const user = await DataBase.findOne({ Email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //check if user already have Home created or alredy join some Home
        if (user.Home_Id != null) {
            return res.status(400).json({ message: "User already has a home" });
        }

        const user_id = user._id;

        //Creating New Home
        const Home_owner = new HomeDB({ 
            HomeName, 
            Home_owner: user_id, 
            Topic, 
            User_ID: [user_id] // Add the user_id to the User_ID array
        });

        await Home_owner.save();

        const HomeID = Home_owner._id;
        
        //Updating User with created user id
        await DataBase.findOneAndUpdate({ Email }, { Home_Id: HomeID });

        return res.status(200).json({ message: "Home is created", HomeID });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const Join_Home = async (req, res) => {
    const { user_Id, Home_Id } = req.body;

    try {
        if (user_Id && Home_Id) {
            const user = await DataBase.findById(user_Id);
            const homeName = await HomeDB.findById(Home_Id)
            if (user) {
                ////// Use user.Verified if user verification needed in these api
                // if (user.Verified) {
                    const join = new JoinModel({
                        homeID: Home_Id,
                        Home_Name: homeName.HomeName,
                    })
                    await join.save()
                    const updateuser = await DataBase.findOneAndUpdate({ _id: user_Id }, { $addToSet: { Join_ID: join._id } }, { new: true });

                    const updatehome = await HomeDB.findOneAndUpdate({_id:Home_Id},{ $addToSet: { User_ID:user_Id } }  , { new: true });
                    return res.status(200).json({ message: "Home Joined", updatehome, updateuser });
                
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

        //THis is for Unique Room Name
        const sameRoomName = await RoomDB.findOne({ Room_Name: RoomName, Home_id: Home_Id });
        if (sameRoomName) {
            return res.status(404).json({ message: "Room name already exists" });
        }

        // Create room
        const room = new RoomDB({ Room_Name: RoomName, Home_id: Home_Id });
        await room.save(); // Save room to database

        // Update room name to include room ID
        const updatedRoomName = `${room._id}_${RoomName}`;
        room.Room_Name = updatedRoomName;
        await room.save();

        // Update home with new room
        home.Room_ID.push(room._id);
        await home.save();

        return res.status(200).json({ message: "Room is added", roomID: room._id });
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};




const getUserData = async (req, res) => {
    const { Email } = req.query;
    try {
        //Populate user to destructure data
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
        return res.status(500).json(err);
    }
}


const deleteRoom = async (req, res) => {
    const { user_id, home_id, room_id } = req.body;
    try {
        //Find user from Home Data Base
        const home = await HomeDB.findById(home_id);
        if (!home) {
            return res.status(404).json({ error: "Home not found" });
        }
        if (String(home.Home_owner) != user_id) {
            return res.status(403).json({ error: "User is not owner of the home" });
        }
        if (!home.Room_ID || !Array.isArray(home.Room_ID)) {
            return res.status(500).json({ error: "Invalid room data in the home document" });
        }
        const index = home.Room_ID.indexOf(room_id);
        if (index === -1) {
            return res.status(404).json({ error: "Room is not in this Home" });
        }
        //find and delete Room  
        const delete_Room = await RoomDB.findByIdAndDelete(room_id);
        home.Room_ID.splice(index, 1);
        await home.save();
        return res.status(200).json({ message: "Room is deleted" });
    } catch (error) {
        console.log(error);
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
        // if (user.Verified) {
            room.Devices_id.push(device._id);
            await room.save();
            return res.status(200).json({ message: "device is added", deviceID:device._id});


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


const updateuserdata = async (req, res) => {
    const { phonenumber, Address, name, email } = req.body;
    try {
        const user = await DataBase.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (phonenumber) user.PhoneNumber = phonenumber;
        if (Address) user.Address = Address;
        if (name) user.Name = name;

        await user.save();
        return res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};


const deleteDevice = async (req, res) => {
    const { device_id, Email, home_id, Room_id } = req.body;
    try {
        const user = await DataBase.findOne({ Email: Email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const home = await HomeDB.findOne({ _id: home_id, Home_owner: user._id, Room_ID: Room_id });
        if (!home) return res.status(404).json({ message: "User is not the owner of the Home or Home not found" });

        const device = await DeviceDB.findById(device_id);
        if (!device) {
            return res.status(400).json({ message: "Device not found" });
        }

        // Remove device
        await DeviceDB.findByIdAndDelete(device_id);

        // Update the room to remove the reference to the device
        await RoomDB.findByIdAndUpdate(Room_id, { $pull: { Devices: device_id } });

        return res.status(200).json({ message: "Device deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};


const updateroom = async (req, res) => {
    const { newroomname, room_id, email } = req.body;
    try {
        // Find the user by email
        const user = await DataBase.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the room by ID
        const room = await RoomDB.findById(room_id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Find the home by ID
        const home = await HomeDB.findById(room.Home_id);
        if (!home) {
            return res.status(404).json({ message: "Home not found" });
        }

        // Check if the user is the home owner
        if (home.Home_owner.toString() === user._id.toString()) {
            if (newroomname) {
                room.Room_Name = newroomname;
                await room.save();
                return res.status(200).json({ message: "Room name updated successfully" });
            } else {
                return res.status(400).json({ message: "Provide new room name" });
            }
        } else {
            return res.status(403).json({ message: "User is not the home owner" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", error });
    }
};


const updateDevice = async (req, res) => {
    const { devicenewname, email, deviceid, roomid } = req.body;
    try {
        // Find the user by email
        const user = await DataBase.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the room by ID
        const room = await RoomDB.findById(roomid);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Find the home by ID
        const home = await HomeDB.findById(room.Home_id);
        if (!home) {
            return res.status(404).json({ message: "Home not found" });
        }

        // Check if the user is the home owner
        if (home.Home_owner.toString() === user._id.toString()) {
            // Find the device by ID
            const device = await DeviceDB.findById(deviceid);
            if (!device) {
                return res.status(404).json({ message: "Device not found" });
            }

            // Check if the device belongs to the specified room
            if (device.Room_id.toString() !== roomid) {
                return res.status(400).json({ message: "Device does not belong to the specified room" });
            }

            // Update the device name
            if (devicenewname) {
                device.Device_name = devicenewname;
                await device.save();
                return res.status(200).json({ message: "Device name updated successfully" });
            } else {
                return res.status(400).json({ message: "Provide new device name" });
            }
        } else {
            return res.status(403).json({ message: "User is not the home owner" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", error });
    }
};

const Addnode = async (req, res) => {
    const { Email, RoomID, HomeID, DeviceID, NodeType, NodeName, NodeIcon } = req.body;

    if (!Email || !RoomID || !HomeID || !DeviceID || !NodeType || !NodeName || !NodeIcon) {
        return res.status(400).json({ message: "Provide Email, RoomID, HomeID, DeviceID, NodeType, NodeName, NodeIcon" });
    }

    try {
        const user = await DataBase.findOne({ Email });
        if (!user) return res.status(400).json({ message: "Email not found" });

        const home = await HomeDB.findById(HomeID);
        if (!home) return res.status(400).json({ message: "Home not found" });
        // if (user._id != home.Home_owner) return res.status(400).json({ message: "User is not the owner of this home" });

        const home_ = await HomeDB.findOne({ _id: HomeID, Home_owner: user._id, Room_ID: RoomID });
        if (!home_) return res.status(404).json({ message: "User is not the owner of the Home" });

        const room = await RoomDB.findById(RoomID);
        if (!room) return res.status(400).json({ message: "Room not found" });
        if (HomeID != room.Home_id) return res.status(400).json({ message: "This room is not in this home" });

        const device = await DeviceDB.findById(DeviceID);
        if (!device) return res.status(400).json({ message: "Device not found" });
        // if (device.Room_id != room._id) return res.status(400).json({ message: "This device is not in this room" });
       
        const Device_in_room = await DeviceDB.findOne({ Device_name: device.Device_name, Room_id: RoomID });
        if (!Device_in_room) {
            return res.status(400).json({ Messaage: "This device is not in this room" });
        }
        const node_in_device = await NodeDB.findOne({Name:NodeName,Device_id: DeviceID})
        if(node_in_device){
            return res.status(400).json({message:"thus named node is already in this device"})
        }
        const node = new NodeDB({ type: NodeType, Name: NodeName, Icon: NodeIcon, Device_id: DeviceID });
        await node.save();

        device.Node_id.push(node._id);
        await device.save();

        return res.status(200).json({ message: "Node added", node__id: node._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getHomedata = async(req,res)=>{
    const {HomeID}=req.body;
    try{
        const data = await HomeDB.findById(HomeID);
        console.log(data);
        return res.status(200).json(data);
    }catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
}

module.exports = { Registration, Login, Addnode ,deleteRoom,verify, Homecreate,deleteDevice, addDevice, addRoom, kickuser,Join_Home,updateDevice,updateroom,getUserData, reverify,updateuserdata, forgotpassword ,deleteHome,Refresh_token};

