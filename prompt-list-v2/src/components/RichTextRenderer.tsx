import React from 'react';
import styles from './RichText.module.css';

interface RichTextRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

// Utility to copy rich HTML formatting to clipboard while keeping a clean plain text fallback
export async function copyRichPrompt(content: string): Promise<void> {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/div>/gi, "\n");
    const plainText = (tempDiv.textContent || tempDiv.innerText || content).trim();

    if (navigator.clipboard && window.ClipboardItem && /<\/?[a-z][\s\S]*>/i.test(content)) {
      const htmlBlob = new Blob([content], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const data = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([data]);
    } else {
      await navigator.clipboard.writeText(plainText || content);
    }
  } catch (err) {
    // Fallback if writing ClipboardItem is restricted in current browser environment
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || content;
    await navigator.clipboard.writeText(plainText);
  }
}

export default function RichTextRenderer({ content, className = '', style = {} }: RichTextRendererProps) {
  // Check if content contains HTML tags; if not, preserve plain text linebreaks
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (!hasHtml) {
    return (
      <div className={`${styles.rendererContent} ${className}`} style={style}>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{content}</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.rendererContent} ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
