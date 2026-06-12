import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../lib/supabase.js";

// POST /auth/login
// Body: { id, password }  (id = username)
export async function login(req, res) {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", id)
    .single();

  if (error || !user) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  const { password_hash: _pw, ...userWithoutPassword } = user;
  return res.json({ token, user: userWithoutPassword });
}

// POST /auth/logout
export function logout(_req, res) {
  return res.json({ message: "로그아웃 되었습니다." });
}

// GET /auth/me
export async function getMe(req, res) {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name, role, username, last_login_at, created_at")
    .eq("id", req.user.id)
    .single();

  if (error || !user) {
    return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
  }

  return res.json(user);
}
