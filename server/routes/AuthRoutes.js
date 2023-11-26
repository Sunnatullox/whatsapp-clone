import { Router } from "express";
import { generateToken, getAllUsers, loginUserforGoogle, onBoardUser } from "../controllers/AuthController.js";

const router = Router()

router.post("/check-user", loginUserforGoogle)
router.post("/onboard-user", onBoardUser)
router.get("/get-contacts", getAllUsers)
router.get("/generate-token/:userId", generateToken)


export default router