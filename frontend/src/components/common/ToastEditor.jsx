import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

// ============================================
// ToastEditor - Toast UI Editor React 래퍼
//
// Toast UI Editor는 React 전용 패키지가 아니라
// 순수 JS 라이브러리입니다. 그래서 useEffect로
// DOM 요소에 직접 에디터를 붙이고, 컴포넌트가
// 사라질 때 destroy()로 정리합니다.
//
// forwardRef: 부모 컴포넌트에서 ref를 통해
// 에디터 내용을 꺼낼 수 있도록 합니다.
//   const editorRef = useRef();
//   editorRef.current.getMarkdown()  ← 본문 내용 가져오기
//
// Props:
//   initialValue - 초기 내용 (수정 페이지에서 사용)
//   height       - 에디터 높이 (기본값: "500px")
// ============================================

const ToastEditor = forwardRef(function ToastEditor(
	{ initialValue = "", height = "500px" },
	ref,
) {
	const containerRef = useRef(null); // 에디터가 붙을 DOM 요소
	const editorRef = useRef(null);    // 에디터 인스턴스

	useEffect(() => {
		// 에디터 생성
		editorRef.current = new Editor({
			el: containerRef.current,
			height,
			initialEditType: "wysiwyg", // 기본: 비주얼 편집 모드
			previewStyle: "tab",         // 마크다운 모드의 미리보기 방식
			initialValue,
			toolbarItems: [
				["heading", "bold", "italic", "strike"],
				["hr", "quote"],
				["ul", "ol", "task"],
				["table", "image", "link"],
				["code", "codeblock"],
			],
		});

		// 컴포넌트가 화면에서 사라질 때 에디터 정리
		// (메모리 누수 방지)
		return () => {
			editorRef.current?.destroy();
		};
	// initialValue는 처음 마운트 시에만 적용
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// 부모 컴포넌트에서 ref.current.xxx() 형태로 호출할 수 있는 메서드를 정의
	useImperativeHandle(ref, () => ({
		getMarkdown: () => editorRef.current?.getMarkdown() ?? "",
		getHTML:     () => editorRef.current?.getHTML() ?? "",
		setMarkdown: (value) => editorRef.current?.setMarkdown(value),
	}));

	return <div ref={containerRef} />;
});

export default ToastEditor;
