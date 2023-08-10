const express = require("express");
const { createUser,
    loginUserCtrl,
    getallUser,
    getUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    handelrefreshToken,
    logout
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
createUser
router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get('/all-Users', getallUser);
router.get("/refresh", handelrefreshToken);
router.get("/logout",logout);
router.get('/:id', authMiddleware,isAdmin, getUser);
router.delete("/:id", deleteaUser);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
module.exports = router;