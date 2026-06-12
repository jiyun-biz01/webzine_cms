import { useEditor, EditorContent } from "@tiptap/react";
import { useRef, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import * as templateService from "@/services/templateService";
import styles from "./TipTapEditor.module.css";

// 폰트 사이즈 커스텀 확장
const FontSize = Extension.create({
	name: "fontSize",
	addOptions() {
		return { types: ["textStyle"] };
	},
	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					fontSize: {
						default: null,
						parseHTML: (el) => el.style.fontSize || null,
						renderHTML: (attrs) =>
							attrs.fontSize
								? { style: `font-size: ${attrs.fontSize}` }
								: {},
					},
				},
			},
		];
	},
	addCommands() {
		return {
			setFontSize:
				(size) =>
				({ chain }) =>
					chain().setMark("textStyle", { fontSize: size }).run(),
			unsetFontSize:
				() =>
				({ chain }) =>
					chain().setMark("textStyle", { fontSize: null }).run(),
		};
	},
});

const FONT_SIZES = [
	"12px",
	"14px",
	"16px",
	"18px",
	"20px",
	"24px",
	"28px",
	"32px",
];

const TOOLBAR = [
	{
		group: "history",
		items: [
			{ command: "undo", icon: "undo", title: "실행 취소" },
			{ command: "redo", icon: "redo", title: "다시 실행" },
		],
	},
	{
		group: "format",
		items: [
			{ command: "bold", icon: "format_bold", title: "굵게" },
			{ command: "italic", icon: "format_italic", title: "기울임" },
			{ command: "underline", icon: "format_underlined", title: "밑줄" },
			{ command: "strike", icon: "strikethrough_s", title: "취소선" },
		],
	},
	{
		group: "align",
		items: [
			{
				command: "alignLeft",
				icon: "format_align_left",
				title: "왼쪽 정렬",
			},
			{
				command: "alignCenter",
				icon: "format_align_center",
				title: "가운데 정렬",
			},
			{
				command: "alignRight",
				icon: "format_align_right",
				title: "오른쪽 정렬",
			},
		],
	},
	{
		group: "block",
		items: [
			{ command: "h2", icon: "title", title: "제목 2" },
			{ command: "h3", icon: "text_fields", title: "제목 3" },
			{
				command: "bulletList",
				icon: "format_list_bulleted",
				title: "글머리 기호",
			},
			{
				command: "orderedList",
				icon: "format_list_numbered",
				title: "번호 목록",
			},
			{ command: "blockquote", icon: "format_quote", title: "인용" },
			{ command: "codeBlock", icon: "note_alt", title: "코드 블록" },
			{
				command: "horizontalRule",
				icon: "horizontal_rule",
				title: "구분선",
			},
		],
	},
	{
		group: "media",
		items: [{ command: "image", icon: "image", title: "이미지 삽입" }],
	},
	{
		group: "source",
		items: [
			{ command: "sourceView", icon: "html", title: "HTML 소스 보기" },
		],
	},
];

function execCommand(editor, command) {
	const chain = editor.chain().focus();
	switch (command) {
		case "undo":
			return chain.undo().run();
		case "redo":
			return chain.redo().run();
		case "bold":
			return chain.toggleBold().run();
		case "italic":
			return chain.toggleItalic().run();
		case "underline":
			return chain.toggleUnderline().run();
		case "strike":
			return chain.toggleStrike().run();
		case "inlineCode":
			return chain.toggleCode().run();
		case "alignLeft":
			return chain.setTextAlign("left").run();
		case "alignCenter":
			return chain.setTextAlign("center").run();
		case "alignRight":
			return chain.setTextAlign("right").run();
		case "h2":
			return chain.toggleHeading({ level: 2 }).run();
		case "h3":
			return chain.toggleHeading({ level: 3 }).run();
		case "bulletList":
			return chain.toggleBulletList().run();
		case "orderedList":
			return chain.toggleOrderedList().run();
		case "blockquote":
			return chain.toggleBlockquote().run();
		case "codeBlock":
			return chain.toggleCodeBlock().run();
		case "horizontalRule":
			return chain.setHorizontalRule().run();
		default:
			return false;
	}
}

function isActive(editor, command) {
	switch (command) {
		case "bold":
			return editor.isActive("bold");
		case "italic":
			return editor.isActive("italic");
		case "underline":
			return editor.isActive("underline");
		case "strike":
			return editor.isActive("strike");
		case "inlineCode":
			return editor.isActive("code");
		case "alignLeft":
			return editor.isActive({ textAlign: "left" });
		case "alignCenter":
			return editor.isActive({ textAlign: "center" });
		case "alignRight":
			return editor.isActive({ textAlign: "right" });
		case "h2":
			return editor.isActive("heading", { level: 2 });
		case "h3":
			return editor.isActive("heading", { level: 3 });
		case "bulletList":
			return editor.isActive("bulletList");
		case "orderedList":
			return editor.isActive("orderedList");
		case "blockquote":
			return editor.isActive("blockquote");
		case "codeBlock":
			return editor.isActive("codeBlock");
		default:
			return false;
	}
}

function TipTapEditor({
	value,
	onChange,
	placeholder = "기사 본문을 입력하세요",
}) {
	const fileInputRef = useRef(null);
	const [sourceMode, setSourceMode] = useState(false);
	const [sourceHtml, setSourceHtml] = useState("");

	const handleImageUpload = async (file) => {
		if (!file) return;
		try {
			const { url } = await templateService.uploadImage(file);
			editor.chain().focus().setImage({ src: url }).run();
		} catch {
			alert("이미지 업로드에 실패했습니다.");
		}
	};

	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			TextStyle,
			FontSize,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Image.configure({ inline: false }),
			Link.configure({ openOnClick: false }),
			Placeholder.configure({ placeholder }),
		],
		content: value || "",
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
	});

	if (!editor) return null;

	return (
		<div className={styles.wrapper}>
			{/* 이미지 파일 인풋 (숨김) */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				style={{ display: "none" }}
				onChange={(e) => {
					handleImageUpload(e.target.files[0]);
					e.target.value = "";
				}}
			/>

			{/* 툴바 */}
			<div className={styles.toolbar}>
				{/* 폰트 사이즈 */}
				<div className={styles.toolGroup}>
					<select
						className={styles.fontSizeSelect}
						defaultValue=""
						onChange={(e) => {
							const val = e.target.value;
							if (val)
								editor.chain().focus().setFontSize(val).run();
							else editor.chain().focus().unsetFontSize().run();
							e.target.value = "";
						}}
					>
						<option value="">크기</option>
						{FONT_SIZES.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
				</div>

				{/* 나머지 버튼 그룹 */}
				{TOOLBAR.map((group, gi) => (
					<div key={gi} className={styles.toolGroup}>
						{group.items.map((item) => (
							<button
								key={item.command}
								type="button"
								title={item.title}
								className={`${styles.toolBtn} ${isActive(editor, item.command) ? styles.active : ""}`}
								onClick={() => {
									if (item.command === "image") {
										fileInputRef.current?.click();
									} else if (item.command === "sourceView") {
										if (!sourceMode) {
											setSourceHtml(editor.getHTML());
											setSourceMode(true);
										} else {
											editor.commands.setContent(
												sourceHtml,
												false,
											);
											onChange?.(sourceHtml);
											setSourceMode(false);
										}
									} else {
										execCommand(editor, item.command);
									}
								}}
							>
								<span className="material-icons">
									{item.icon}
								</span>
							</button>
						))}
					</div>
				))}
			</div>

			{/* 에디터 본문 */}
			{sourceMode ? (
				<textarea
					className={styles.sourceTextarea}
					value={sourceHtml}
					onChange={(e) => setSourceHtml(e.target.value)}
					spellCheck={false}
				/>
			) : (
				<EditorContent
					editor={editor}
					className={styles.editorContent}
				/>
			)}
		</div>
	);
}

export default TipTapEditor;
