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
					{ id: "article-all",       label: "전체 기사",   path: "/articles" },
					{ id: "article-published", label: "발행된 기사", path: "/articles/published" },
					{ id: "article-draft",     label: "임시저장",    path: "/articles/drafts" },
					{ id: "article-archived",  label: "보관함",      path: "/articles/archived" },
				],
			},
			{ id: "article-write", label: "기사 작성", path: "/articles/write" },
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
		id: "category",
		icon: "🏷️",
		label: "카테고리 관리",
		children: [
			{ id: "category-list", label: "카테고리 목록", path: "/categories" },
		],
	},
	{
		id: "subscriber",
		icon: "📧",
		label: "구독자 관리",
		children: [
			{ id: "subscriber-list",  label: "구독자 목록", path: "/subscribers" },
			{ id: "subscriber-stats", label: "구독자 통계", path: "/subscribers/stats" },
		],
	},
];

export default menuData;
