import React, { useRef, useEffect } from 'react';
import styles from './RichText.module.css';
import { Bold, Italic, Underline, List, ListOrdered, Code, Quote, Eraser, Sparkles } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Enter prompt parameters, seeds, or camera flags with rich formatting..." }: RichTextEditorProps) {
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
  }, []);

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

  const insertCode = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      document.execCommand('insertHTML', false, '<code>--param 1.0</code>&nbsp;');
    } else {
      document.execCommand('insertHTML', false, `<code>${selection.toString()}</code>`);
    }
    if (editorRef.current) {
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
    } catch (e) {
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

  // Convert common AI markdown symbols to rich HTML formatting
  const handleAutoFormatMarkdown = () => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;
    // Replace markdown **bold** with <strong>bold</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Replace markdown `code` with <code>code</code>
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    editorRef.current.innerHTML = html;
    onChange(html);
  };

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolBtn} onClick={() => exec('bold')} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('italic')} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('underline')} title="Underline (Ctrl+U)">
          <Underline size={14} />
        </button>

        <div className={styles.separator} />

        <button type="button" className={styles.toolBtn} onClick={() => exec('insertUnorderedList')} title="Bullet List">
          <List size={14} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('insertOrderedList')} title="Numbered List">
          <ListOrdered size={14} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exec('formatBlock', '<blockquote>')} title="Quote / Callout">
          <Quote size={14} />
        </button>
        <button type="button" className={styles.toolBtn} onClick={insertCode} title="Parameter / Inline Code">
          <Code size={14} />
        </button>

        <div className={styles.separator} />

        <button type="button" className={styles.toolBtn} onClick={() => exec('removeFormat')} title="Clear Formatting">
          <Eraser size={14} />
          <span>Clear</span>
        </button>

        <button 
          type="button" 
          className={styles.toolBtn} 
          onClick={handleAutoFormatMarkdown} 
          style={{ marginLeft: 'auto', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}
          title="Instantly transform AI Markdown asterisks and backticks into styled Rich Text"
        >
          <Sparkles size={13} />
          <span>Format AI Markdown</span>
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
