import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// ============================================
// MenuItem - 재귀적으로 메뉴를 렌더링하는 컴포넌트
//
// path가 있는 항목 (리프 노드) → NavLink로 렌더링
//   - NavLink는 현재 URL과 일치하면 자동으로 "active" 클래스를 붙여줌
// path가 없는 항목 (부모 노드) → 버튼으로 렌더링 (클릭 시 하위 메뉴 펼침/접힘)
// ============================================

function MenuItem({ item, depth = 0 }) {
	const hasChildren = item.children && item.children.length > 0;
	const location = useLocation();

	// 현재 URL이 자식 항목 중 하나와 일치하는지 재귀적으로 확인
	// → 페이지를 새로고침해도 해당 부모 메뉴가 자동으로 펼쳐지게 하기 위함
	const hasActiveDescendant = (node) => {
		if (node.path && location.pathname.startsWith(node.path)) return true;
		if (node.children) return node.children.some(hasActiveDescendant);
		return false;
	};

	const [isOpen, setIsOpen] = useState(
		() => hasChildren && hasActiveDescendant(item),
	);

	// path가 있는 리프 노드: NavLink로 렌더링
	if (!hasChildren && item.path) {
		return (
			<li>
				<NavLink
					to={item.path}
					end // exact 매칭: /settings 가 /settings/theme 에서도 active가 되는 걸 방지
					className={({ isActive }) =>
						[
							"menu-btn",
							`depth-${depth}`,
							isActive ? "active" : "",
						].join(" ")
					}
					style={{ paddingLeft: `${1.2 + depth * 1}rem` }}
				>
					{depth === 0 && item.icon && (
						<span className="menu-icon">{item.icon}</span>
					)}
					{depth > 0 && <span className="menu-depth-dot" />}
					<span className="menu-label">{item.label}</span>
				</NavLink>
			</li>
		);
	}

	// 하위 메뉴가 있는 부모 노드: 버튼으로 렌더링
	return (
		<li>
			<button
				className={[
					"menu-btn",
					`depth-${depth}`,
					"has-children",
				].join(" ")}
				onClick={() => setIsOpen((prev) => !prev)}
				style={{ paddingLeft: `${1.2 + depth * 1}rem` }}
			>
				{depth === 0 && item.icon && (
					<span className="menu-icon">{item.icon}</span>
				)}
				{depth > 0 && <span className="menu-depth-dot" />}
				<span className="menu-label">{item.label}</span>
				<span className={`menu-arrow ${isOpen ? "open" : ""}`}>›</span>
			</button>

			{/* 하위 메뉴 - 재귀 호출 */}
			{isOpen && (
				<ul className={`submenu submenu-depth-${depth + 1}`}>
					{item.children.map((child) => (
						<MenuItem key={child.id} item={child} depth={depth + 1} />
					))}
				</ul>
			)}
		</li>
	);
}

export default MenuItem;
