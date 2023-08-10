const req = require("express/lib/request");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { genrateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbid");
const { genraterefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");

const createUser = asyncHandler(async (req, res) =>
{
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });

    if (!findUser)
    {
        //create a new user  
        const newUser = User.create(req.body);
        res.json(newUser);
    } else
    {
        //User already Exists
       throw new Error("User already Exists")
    }
});
//login user
const loginUserCtrl = asyncHandler(async (req, res) =>
{
    const { email, password } = req.body;
    //Check if user exixts or not
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password))
    {
        const refreshToken = await genraterefreshToken(findUser?.id);
        const updateuser = await User.findByIdAndUpdate(findUser.id,{
            refreshToken: refreshToken,
        },
        { new:true}
        );
        res.cookie('refreshToken',refreshToken, {
        httpOnly:true,
        maxAge:72*60*60*1000,
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: genrateToken(findUser?._id),
        });
    } else
    {
        throw new Error("Invalid Credential");
    }
});

//handel refreeshtoken

const handelrefreshToken= asyncHandler(async (req,res)=>{
const cookie =req.cookies;
if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
const refreshToken= cookie.refreshToken;
console.log(refreshToken);
const user=await User.findOne({refreshToken});
if(!user) throw new Error('No Refresh token present in db or not matched');
jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded) =>{
if( err|| user.id !== decoded.id){
    throw new Error("There is something wrong with refresh token")
}
const accessToken= genrateToken(User?.id)
res.json({accessToken});
});
res.json(user);

});

//logout Functionality

const logout = asyncHandler(async (req,res) => {
const cookie =req.cookies;
if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
const refreshToken= cookie.refreshToken;
const user=await User.findOne({refreshToken});
if(!user){
    res.clearCookie("refreshToken",{
    httpOnly:true,
    secure: true,
});
return res.sendStatus(204);//forbiden
}
await User.findOneAndUpdate(refreshToken ,{
    refreshToken: "",
});
 res.clearCookie("refreshToken",{
        httpOnly:true,
    secure: true,
});
res.sendStatus(204);//forbiden
});

//Update a user

const updatedUser = asyncHandler(async (req, res) =>
{
    const { id } = req.user;
    try
    {
        const updatedUser = await User.findByIdAndUpdate(id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },
            {
            new: true,
            }
        );
        res.json(updatedUser);
    }
    catch (error)
    {
        throw new Error(error);
    }
});

//Get all the users

const getallUser = asyncHandler(async (req, res) =>
{
    try
    {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch (error)
    {
        throw new Error(error);
    }
});

//Get a single user

const getUser = asyncHandler(async (req,res) =>
{
    const { id } = req.params;
    validateMongoDbId(id);
    try
    {
        const getUser = await User.findById(id);
        res.json({
            getUser,
        });

        
    }
    catch (error)
    {
        throw new Error(error);
    }
});


//delete a user

const deleteaUser = asyncHandler(async (req,res) =>
{
    const { id } = req.params;
    validateMongoDbId(id);
    try
    {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        });

        
    }
    catch (error)
    {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) =>
{ 
    const { id } = req.params;
    validateMongoDbId(id);
    try
    {
        const block = User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "User Blocked",
        });
    } catch (error)
    {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try
    {
        const unblock = User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "User Unblocked",
        });
    } catch (error)
    {
        throw new Error(error);
    } });


module.exports = {
    createUser,
    loginUserCtrl,
    getallUser,
    getUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    handelrefreshToken,
    logout,
};
 