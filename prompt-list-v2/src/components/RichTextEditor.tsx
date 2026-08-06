import React, { useRef, useEffect } from 'react';
import styles from './RichText.module.css';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Enter prompt parameters, seeds, or camera flags with formatting..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Keep editor in sync when value is reset (e.g. form cleared)
  useEffect(() => {
    if (editorRef.current && value === '' && editorRef.current.innerHTML !== '') {
      editorRef.current.innerHTML = '';
    }
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current && editorRef.current && value) {
      editorRef.current.innerHTML = value;
      isFirstRender.current = false;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const cleanPastedHTML = (rawHtml: string): string => {
    try {
      const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
      const allElements = doc.body.getElementsByTagName('*');
      for (let i = allElements.length - 1; i >= 0; i--) {
        const el = allElements[i];
        // Remove external inline styles and classes that mess up dark mode themes
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
        el.removeAttribute('dir');
        el.removeAttribute('color');
        el.removeAttribute('face');
        el.removeAttribute('size');
        // Strip out scripts and unsafe elements
        if (['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'STYLE', 'META'].includes(el.tagName)) {
          el.remove();
        }
      }
      return doc.body.innerHTML;
    } catch (_e) {
      return rawHtml;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData('text/html');
    const textData = e.clipboardData.getData('text/plain');

    if (htmlData) {
      const clean = cleanPastedHTML(htmlData);
      document.execCommand('insertHTML', false, clean);
    } else if (textData) {
      // Preserve linebreaks and formatting for plain text pastes
      const formattedText = textData
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r\n/g, "\n")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>");
      document.execCommand('insertHTML', false, `<p>${formattedText}</p>`);
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolBtn} onClick={() => exec('bold')} title="Bold (Ctrl+B)">
          <Bold size={15} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('italic')} title="Italic (Ctrl+I)">
          <Italic size={15} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('underline')} title="Underline (Ctrl+U)">
          <Underline size={15} />
        </button>

        <div className={styles.separator} />

        <button type="button" className={styles.toolBtn} onClick={() => exec('insertUnorderedList')} title="Bullet List">
          <List size={15} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('insertOrderedList')} title="Numbered List">
          <ListOrdered size={15} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className={styles.editorContent}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
      />
    </div>
  );
}
