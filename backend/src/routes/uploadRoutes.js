import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/authMiddleware.js";

// ============================================
// uploadRoutes - 이미지 파일 업로드 라우터
//
// POST /upload/image
//   → 이미지 파일 1개를 서버에 저장하고 URL을 반환합니다.
//   → 반환값: { url: "/uploads/파일명" }
//
// 업로드된 파일은 backend/uploads/ 에 저장됩니다.
// ============================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// multer 설정: 파일을 uploads/ 폴더에 저장
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  // 파일명 충돌 방지: 타임스탬프 + 원본 확장자
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

// 이미지 파일만 허용 (jpg, jpeg, png, gif, webp)
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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 최대 10MB
});

const router = Router();

// POST /upload/image
router.post(
  "/image",
  authMiddleware,
  upload.single("image"), // form-data 필드명: "image"
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "파일이 없습니다." });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
  },
);

export default router;
