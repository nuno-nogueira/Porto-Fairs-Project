import {Router} from "express";
import * as usersControllers from "../controllers/users";
import {auth} from "../middleware/auth"

const router = Router();

router.post("/register", usersControllers.registerUser);
router.post("/login", usersControllers.loginUser);

router.get("/me", auth, usersControllers.getUser);
router.get("/", auth, usersControllers.getAllUsers);

export default router;