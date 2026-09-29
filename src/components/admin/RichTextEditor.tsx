"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { getSafeExternalUrl } from "@/lib/product-media";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const toolbarButton = "flex size-8 items-center justify-center rounded text-sm transition hover:bg-[#e8f2f0] hover:text-[#116966] disabled:opacity-35";

export default function RichTextEditor({ value, onChange, disabled = false }: RichTextEditorProps) {
  const [urlMode, setUrlMode] = useState<"link" | "image" | null>(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true, defaultProtocol: "https" } }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Nhập nội dung mô tả chi tiết..." }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "product-editor-content min-h-64 px-4 py-3 text-sm text-[#263d48] outline-none",
        role: "textbox",
        "aria-label": "Nội dung mô tả sản phẩm",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML()),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      underline: currentEditor?.isActive("underline") ?? false,
      strike: currentEditor?.isActive("strike") ?? false,
      h2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      h3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      bullet: currentEditor?.isActive("bulletList") ?? false,
      ordered: currentEditor?.isActive("orderedList") ?? false,
      quote: currentEditor?.isActive("blockquote") ?? false,
      code: currentEditor?.isActive("codeBlock") ?? false,
      link: currentEditor?.isActive("link") ?? false,
    }),
  });
  const activeClass = (active?: boolean) => `${toolbarButton} ${active ? "bg-[#d9ece9] text-[#0d6260]" : "text-[#52636c]"}`;
  const openUrl = (mode: "link" | "image") => {
    setUrlMode(mode); setUrlError("");
    setUrl(mode === "link" ? editor?.getAttributes("link").href ?? "" : "");
  };
  const applyUrl = () => {
    if (!editor || !urlMode) return;
    const safeUrl = getSafeExternalUrl(url.trim());
    if (!safeUrl) { setUrlError("Chỉ chấp nhận URL HTTP hoặc HTTPS hợp lệ."); return; }
    if (urlMode === "link") editor.chain().focus().extendMarkRange("link").setLink({ href: safeUrl }).run();
    else editor.chain().focus().setImage({ src: safeUrl }).run();
    setUrlMode(null); setUrl(""); setUrlError("");
  };

  return <div className="mt-1 overflow-hidden rounded border border-[#cbd6d8] bg-white focus-within:border-[#6aaaa6] focus-within:ring-1 focus-within:ring-[#6aaaa6]">
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[#dce3e5] bg-[#f7f9f9] p-1.5" aria-label="Công cụ định dạng">
      <button type="button" title="Đậm" aria-label="Đậm" aria-pressed={state?.bold} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBold().run()} className={activeClass(state?.bold)}><i className="fas fa-bold" aria-hidden="true" /></button>
      <button type="button" title="Nghiêng" aria-label="Nghiêng" aria-pressed={state?.italic} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleItalic().run()} className={activeClass(state?.italic)}><i className="fas fa-italic" aria-hidden="true" /></button>
      <button type="button" title="Gạch chân" aria-label="Gạch chân" aria-pressed={state?.underline} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleUnderline().run()} className={activeClass(state?.underline)}><i className="fas fa-underline" aria-hidden="true" /></button>
      <button type="button" title="Gạch ngang" aria-label="Gạch ngang" aria-pressed={state?.strike} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleStrike().run()} className={activeClass(state?.strike)}><i className="fas fa-strikethrough" aria-hidden="true" /></button>
      <span className="mx-1 h-5 w-px bg-[#d2dcde]" aria-hidden="true" />
      <button type="button" title="Tiêu đề cấp 2" aria-label="Tiêu đề cấp 2" aria-pressed={state?.h2} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={activeClass(state?.h2)}>H2</button>
      <button type="button" title="Tiêu đề cấp 3" aria-label="Tiêu đề cấp 3" aria-pressed={state?.h3} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={activeClass(state?.h3)}>H3</button>
      <button type="button" title="Danh sách" aria-label="Danh sách không thứ tự" aria-pressed={state?.bullet} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={activeClass(state?.bullet)}><i className="fas fa-list-ul" aria-hidden="true" /></button>
      <button type="button" title="Danh sách đánh số" aria-label="Danh sách đánh số" aria-pressed={state?.ordered} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={activeClass(state?.ordered)}><i className="fas fa-list-ol" aria-hidden="true" /></button>
      <button type="button" title="Trích dẫn" aria-label="Trích dẫn" aria-pressed={state?.quote} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={activeClass(state?.quote)}><i className="fas fa-quote-right" aria-hidden="true" /></button>
      <button type="button" title="Khối mã" aria-label="Khối mã" aria-pressed={state?.code} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={activeClass(state?.code)}><i className="fas fa-code" aria-hidden="true" /></button>
      <span className="mx-1 h-5 w-px bg-[#d2dcde]" aria-hidden="true" />
      <button type="button" title="Thêm liên kết" aria-label="Thêm liên kết" aria-pressed={state?.link} disabled={!editor || disabled} onClick={() => openUrl("link")} className={activeClass(state?.link)}><i className="fas fa-link" aria-hidden="true" /></button>
      <button type="button" title="Gỡ liên kết" aria-label="Gỡ liên kết" disabled={!editor || disabled || !state?.link} onClick={() => editor?.chain().focus().unsetLink().run()} className={toolbarButton}><i className="fas fa-link-slash" aria-hidden="true" /></button>
      <button type="button" title="Chèn ảnh từ URL" aria-label="Chèn ảnh từ URL" disabled={!editor || disabled} onClick={() => openUrl("image")} className={toolbarButton}><i className="fas fa-image" aria-hidden="true" /></button>
      <span className="mx-1 h-5 w-px bg-[#d2dcde]" aria-hidden="true" />
      <button type="button" title="Hoàn tác" aria-label="Hoàn tác" disabled={!editor || disabled || !editor.can().undo()} onClick={() => editor?.chain().focus().undo().run()} className={toolbarButton}><i className="fas fa-rotate-left" aria-hidden="true" /></button>
      <button type="button" title="Làm lại" aria-label="Làm lại" disabled={!editor || disabled || !editor.can().redo()} onClick={() => editor?.chain().focus().redo().run()} className={toolbarButton}><i className="fas fa-rotate-right" aria-hidden="true" /></button>
    </div>
    {urlMode && <div className="border-b border-[#dce3e5] bg-white p-2"><div className="flex gap-2"><label htmlFor="rich-editor-url" className="sr-only">URL {urlMode === "link" ? "liên kết" : "hình ảnh"}</label><input id="rich-editor-url" autoFocus type="url" value={url} onChange={(event) => { setUrl(event.target.value); setUrlError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyUrl(); } }} placeholder="https://..." className="h-9 min-w-0 flex-1 rounded border border-[#cbd6d8] px-3 text-sm" /><button type="button" onClick={applyUrl} className="h-9 rounded bg-[#116966] px-3 text-xs font-bold text-white">Chèn</button><button type="button" aria-label="Hủy chèn URL" onClick={() => { setUrlMode(null); setUrlError(""); }} className="size-9 text-[#60727a]"><i className="fas fa-xmark" aria-hidden="true" /></button></div>{urlError && <p role="alert" className="mt-1 text-xs text-red-600">{urlError}</p>}</div>}
    <EditorContent editor={editor} />
  </div>;
}
