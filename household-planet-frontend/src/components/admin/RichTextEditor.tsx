'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter description...', height = '300px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' }
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map(({ icon: Icon, command, title }) => (
          <Button
            key={command}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => execCommand(command)}
            title={title}
            className="p-2 h-8 w-8"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="w-px bg-gray-300 mx-1" />
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={insertLink}
          title="Insert Link"
          className="p-2 h-8 w-8"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={insertImage}
          title="Insert Image"
          className="p-2 h-8 w-8"
        >
          <Image className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="div">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        className={`p-4 min-h-[${height}] focus:outline-none ${
          !value && !isEditorFocused ? 'text-gray-400' : 'text-gray-900'
        }`}
        style={{ minHeight: height }}
        suppressContentEditableWarning={true}
      >
        {!value && !isEditorFocused && (
          <div className="text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
