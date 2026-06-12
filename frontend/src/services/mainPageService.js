import api from "@/api/axios";

export async function getMainPage() {
  const res = await api.get("/main-page");
  return res.data;
}

export async function updateMainPage(sections) {
  const res = await api.put("/main-page", { sections });
  return res.data;
}
