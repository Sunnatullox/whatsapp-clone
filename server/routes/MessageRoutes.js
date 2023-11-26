import { Router } from "express";
import {
  addMessage,
  getMessages,
  addImageMessage,
  addAudioMessage,
  getInitialContactwithMessages,
} from "../controllers/MessageController.js";
import multer from "multer";
const router = Router();

const uploadImage = multer({ dest: "upload/images" });
const uploadAudio = multer({ dest: "upload/recordings" });

router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);
router.post("/add-audio-message", uploadAudio.single("audio"), addAudioMessage);
router.get("/get-initial-contacts/:from", getInitialContactwithMessages);

export default router;
