import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "웹진 CMS API",
      version: "1.0.0",
      description: "웹진 CMS 백엔드 REST API 문서",
    },
    servers: [
      { url: "http://localhost:4000", description: "로컬 개발 서버" },
      { url: "https://webzine-cms-api.onrender.com", description: "운영 서버" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Article: {
          type: "object",
          properties: {
            id:          { type: "integer" },
            title:       { type: "string" },
            category:    { type: "string" },
            status:      { type: "string", enum: ["draft", "published", "archived"] },
            content:     { type: "string", description: "HTML 형식" },
            templateId:  { type: "integer", nullable: true },
            author:      { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
            publishedAt: { type: "string", format: "date-time", nullable: true },
            createdAt:   { type: "string", format: "date-time" },
            updatedAt:   { type: "string", format: "date-time" },
          },
        },
        Template: {
          type: "object",
          properties: {
            id:          { type: "integer" },
            name:        { type: "string" },
            description: { type: "string" },
            layoutType:  { type: "string" },
            imageSlots:  { type: "integer" },
            slotLabels:  { type: "array", items: { type: "string" } },
          },
        },
        Subscriber: {
          type: "object",
          properties: {
            id:             { type: "integer" },
            email:          { type: "string", format: "email" },
            status:         { type: "string", enum: ["active", "inactive"] },
            subscribedAt:   { type: "string", format: "date-time" },
            unsubscribedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        User: {
          type: "object",
          properties: {
            id:       { type: "string", format: "uuid" },
            email:    { type: "string", format: "email" },
            name:     { type: "string" },
            role:     { type: "string", enum: ["admin", "editor", "reporter"] },
            username: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    paths: {
      // ── Auth ──────────────────────────────────
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "로그인",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["id", "password"],
                  properties: {
                    id:       { type: "string", example: "editor01" },
                    password: { type: "string", example: "1234" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "로그인 성공", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "인증 실패", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "로그아웃",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "로그아웃 성공" } },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "내 정보 조회",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "유저 정보", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            401: { description: "인증 필요" },
          },
        },
      },

      // ── Articles ─────────────────────────────
      "/articles": {
        get: {
          tags: ["Articles"],
          summary: "기사 목록 조회",
          parameters: [
            { name: "page",   in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit",  in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "archived"] } },
          ],
          responses: { 200: { description: "기사 목록 + 통계" } },
        },
        post: {
          tags: ["Articles"],
          summary: "기사 생성",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title:      { type: "string" },
                    category:   { type: "string" },
                    content:    { type: "string" },
                    status:     { type: "string", enum: ["draft", "published"] },
                    templateId: { type: "integer", nullable: true },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "생성된 기사", content: { "application/json": { schema: { $ref: "#/components/schemas/Article" } } } } },
        },
      },
      "/articles/{id}": {
        get: {
          tags: ["Articles"],
          summary: "기사 단건 조회",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "기사 상세", content: { "application/json": { schema: { $ref: "#/components/schemas/Article" } } } }, 404: { description: "기사 없음" } },
        },
        put: {
          tags: ["Articles"],
          summary: "기사 수정",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "수정된 기사" }, 404: { description: "기사 없음" } },
        },
        delete: {
          tags: ["Articles"],
          summary: "기사 삭제",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 204: { description: "삭제 성공" } },
        },
      },

      // ── Templates ─────────────────────────────
      "/templates": {
        get: {
          tags: ["Templates"],
          summary: "템플릿 목록",
          responses: { 200: { description: "템플릿 목록", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Template" } } } } } },
        },
        post: {
          tags: ["Templates"],
          summary: "템플릿 생성",
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "생성된 템플릿" } },
        },
      },
      "/templates/{id}": {
        get: {
          tags: ["Templates"],
          summary: "템플릿 단건 조회",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "템플릿 상세" }, 404: { description: "템플릿 없음" } },
        },
        put: {
          tags: ["Templates"],
          summary: "템플릿 수정",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "수정된 템플릿" } },
        },
        delete: {
          tags: ["Templates"],
          summary: "템플릿 삭제",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 204: { description: "삭제 성공" } },
        },
      },

      // ── Subscribers ───────────────────────────
      "/subscribers": {
        get: {
          tags: ["Subscribers"],
          summary: "구독자 목록",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page",   in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit",  in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive"] } },
          ],
          responses: { 200: { description: "구독자 목록" } },
        },
        post: {
          tags: ["Subscribers"],
          summary: "구독자 등록 (관리자)",
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "등록된 구독자" } },
        },
      },
      "/subscribers/{id}/activate": {
        patch: {
          tags: ["Subscribers"],
          summary: "구독자 활성화",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "활성화된 구독자" } },
        },
      },
      "/subscribers/{id}/deactivate": {
        patch: {
          tags: ["Subscribers"],
          summary: "구독자 비활성화",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "비활성화된 구독자" } },
        },
      },
      "/subscribers/public/subscribe": {
        post: {
          tags: ["Subscribers"],
          summary: "공개 구독 신청",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string", format: "email" } } } } } },
          responses: { 201: { description: "구독 성공" }, 409: { description: "이미 구독 중" } },
        },
      },
      "/subscribers/public/unsubscribe": {
        post: {
          tags: ["Subscribers"],
          summary: "공개 구독 취소",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string", format: "email" } } } } } },
          responses: { 200: { description: "구독 취소 성공" }, 404: { description: "구독자 없음" } },
        },
      },

      // ── Dashboard ─────────────────────────────
      "/dashboard": {
        get: {
          tags: ["Dashboard"],
          summary: "대시보드 통계",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "통계 카드, 최근 기사, 호 구성 현황" } },
        },
      },

      // ── Main Page ─────────────────────────────
      "/main-page": {
        get: {
          tags: ["Main Page"],
          summary: "메인 페이지 구성 조회",
          responses: { 200: { description: "섹션 구성" } },
        },
        put: {
          tags: ["Main Page"],
          summary: "메인 페이지 구성 저장",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "저장된 구성" } },
        },
      },

      // ── Webzine ───────────────────────────────
      "/webzine/history": {
        get: {
          tags: ["Webzine"],
          summary: "발송 이력 목록",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "발송 이력" } },
        },
      },

      // ── Upload ────────────────────────────────
      "/upload/image": {
        post: {
          tags: ["Upload"],
          summary: "이미지 업로드 (Supabase Storage)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } },
          },
          responses: { 200: { description: "업로드된 이미지 URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" } } } } } } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
