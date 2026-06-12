// ============================================
// 메뉴 구조 데이터
// 메뉴 추가/수정은 이 파일만 편집하면 됩니다
// ============================================

const menuData = [
	{
		id: "dashboard",
		icon: "🏠",
		label: "대시보드",
		path: "/dashboard",
	},
	{
		id: "article",
		icon: "📝",
		label: "기사 관리",
		children: [
			{
				id: "article-list",
				label: "기사 목록",
				children: [
					{ id: "article-all", label: "전체 기사", path: "/articles" },
					{ id: "article-published", label: "발행된 기사", path: "/articles/published" },
					{ id: "article-draft", label: "임시저장", path: "/articles/drafts" },
					{ id: "article-archived", label: "보관함", path: "/articles/archived" },
				],
			},
			{ id: "article-write", label: "기사 작성", path: "/articles/write" },
			{ id: "article-schedule", label: "발행 예약", path: "/articles/schedule" },
		],
	},
	{
		id: "main-page",
		icon: "🗞️",
		label: "메인 페이지 구성",
		children: [
			{ id: "main-page-current", label: "현재 구성", path: "/main-page" },
			{ id: "main-page-history", label: "발송 이력", path: "/main-page/history" },
		],
	},
	{
		id: "template",
		icon: "🎨",
		label: "디자인 템플릿",
		children: [
			{ id: "template-list", label: "템플릿 목록", path: "/templates" },
		],
	},
	{
		id: "user",
		icon: "👥",
		label: "사용자 관리",
		children: [
			{ id: "user-list", label: "회원 목록", path: "/users" },
			{ id: "user-roles", label: "권한 설정", path: "/users/roles" },
		],
	},
	{
		id: "subscriber",
		icon: "📧",
		label: "구독자 관리",
		children: [
			{ id: "subscriber-list", label: "구독자 목록", path: "/subscribers" },
		],
	},
	{
		id: "stats",
		icon: "📊",
		label: "통계",
		children: [
			{ id: "stats-subscribe", label: "구독 통계", path: "/stats/subscribe" },
		],
	},
	{
		id: "settings",
		icon: "⚙️",
		label: "설정",
		children: [
			{ id: "settings-general", label: "일반 설정", path: "/settings" },
			{ id: "settings-theme", label: "테마 설정", path: "/settings/theme" },
			{ id: "settings-seo", label: "SEO 설정", path: "/settings/seo" },
		],
	},
];

export default menuData;
