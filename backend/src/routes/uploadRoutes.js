import { Router } from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import { supabase } from "../lib/supabase.js";

const BUCKET = "article-images";

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase())
               && allowed.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("이미지 파일(jpg, png, gif, webp)만 업로드 가능합니다."));
  }
};

// 로컬 저장 없이 메모리 버퍼로만 받음
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// POST /upload/image
router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 없습니다." });
  }

  const ext      = path.extname(req.file.originalname).toLowerCase();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return res.json({ url: data.publicUrl });
});

export default router;
