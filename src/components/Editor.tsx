import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

interface EditorProps {
  content: string;
}

const Editor = ({ content }: EditorProps) => {
  const [copied, setCopied] = React.useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-lg my-4',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      // Configure marked to properly handle images
      marked.use({
        renderer: {
          image(href, title, text) {
            return `<img src="${href}" alt="${text || ''}" title="${title || ''}" class="max-w-full h-auto rounded-lg shadow-lg my-4">`;
          }
        }
      });

      // Convert markdown to HTML and set it as editor content
      const htmlContent = marked.parse(content, {
        breaks: true,
        gfm: true,
      });
      editor.commands.setContent(htmlContent);
    }
  }, [content, editor]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Content</h2>
      <div className="border rounded-lg bg-white shadow-inner">
        <EditorContent editor={editor} />
      </div>
      {content && (
        <div className="mt-4">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
              <span>View Raw Markdown</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard();
                }}
                className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy markdown"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-x-auto text-sm">
              {content}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default Editor;