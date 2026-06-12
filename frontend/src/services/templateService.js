import api from "@/api/axios";

// ============================================
// templateService - 디자인 템플릿 API 함수 모음
// ============================================

// 템플릿 목록 전체 조회
export async function getTemplates() {
  const response = await api.get("/templates");
  return response.data;
}

// 템플릿 단건 조회
export async function getTemplate(id) {
  const response = await api.get(`/templates/${id}`);
  return response.data;
}

// 템플릿 생성
export async function createTemplate(data) {
  const response = await api.post("/templates", data);
  return response.data;
}

// 템플릿 수정
export async function updateTemplate(id, data) {
  const response = await api.put(`/templates/${id}`, data);
  return response.data;
}

// 템플릿 삭제
export async function deleteTemplate(id) {
  await api.delete(`/templates/${id}`);
}

// 이미지 파일 업로드
// file: File 객체 → 반환값: { url: "/uploads/파일명" }
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data; // { url }
}
