import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Highlighter,
  Minus,
} from 'lucide-react';
import clsx from 'clsx';

interface EditorCanvasProps {
  content: any;
  onUpdate: (json: any) => void;
  editable?: boolean;
}

export function EditorCanvas({ content, onUpdate, editable = true }: EditorCanvasProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Yazmaya baslayin...' }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      onUpdate(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[400px] px-12 py-8',
      },
      handleDrop: (view, event) => {
        const findingData = event.dataTransfer?.getData('application/finding');
        if (findingData) {
          event.preventDefault();
          try {
            const finding = JSON.parse(findingData);
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (pos) {
              const { schema } = view.state;
              const findingText = `[BULGU: ${finding.finding_ref}] ${finding.title} (${(finding.severity || '').toUpperCase()})`;
              const node = schema.nodes.paragraph.create(null, schema.text(findingText));
              const tr = view.state.tr.insert(pos.pos, node);
              view.dispatch(tr);
            }
          } catch {
            /* ignore */
          }
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(content);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editable, editor]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/finding')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  if (!editor) return null;

  return (
    <div className="relative" onDragOver={handleDragOver}>
      {editable && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-slate-900 rounded-xl shadow-2xl flex items-center gap-0.5 px-1.5 py-1">
            <BubbleBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={14} />
            </BubbleBtn>
            <BubbleBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={14} />
            </BubbleBtn>
            <BubbleBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon size={14} />
            </BubbleBtn>
            <BubbleBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough size={14} />
            </BubbleBtn>
            <BubbleBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
              <Highlighter size={14} />
            </BubbleBtn>
            <div className="w-px h-5 bg-slate-700 mx-1" />
            <BubbleBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 size={14} />
            </BubbleBtn>
            <BubbleBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 size={14} />
            </BubbleBtn>
          </div>
        </BubbleMenu>
      )}

      {editable && (
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-2 flex items-center gap-1 flex-wrap">
          <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={15} />
          </ToolBtn>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function BubbleBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx('p-1.5 rounded-lg transition-colors', active ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10')}
    >
      {children}
    </button>
  );
}

function ToolBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx('p-1.5 rounded-lg transition-colors', active ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')}
    >
      {children}
    </button>
  );
}
