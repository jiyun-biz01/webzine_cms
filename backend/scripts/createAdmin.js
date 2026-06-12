import "dotenv/config";
import bcrypt from "bcrypt";
import { supabase } from "../src/lib/supabase.js";

const admins = [
  { email: "admin@webzine.com",    name: "관리자",  password: "admin1234",  role: "admin"    },
  { email: "editor@webzine.com",   name: "김편집",  password: "editor1234", role: "editor"   },
  { email: "reporter@webzine.com", name: "이기자",  password: "reporter1234", role: "reporter" },
];

for (const u of admins) {
  const password_hash = await bcrypt.hash(u.password, 10);
  const { error } = await supabase.from("users").insert({
    email: u.email,
    name: u.name,
    password_hash,
    role: u.role,
    avatar: u.name[0],
  });

  if (error) {
    console.error(`❌ ${u.email} 생성 실패:`, error.message);
  } else {
    console.log(`✅ ${u.email} 생성 완료`);
  }
}

process.exit(0);
