'use client';

import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [highlightedCode, setHighlightedCode] = useState(() => {
    // Escape HTML in initial SSR state so it safely renders as text
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  });

  useEffect(() => {
    try {
      const grammar = Prism.languages[language] || Prism.languages.markup;
      const highlighted = Prism.highlight(code, grammar, language);
      setHighlightedCode(highlighted);
    } catch (e) {
      setHighlightedCode(code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
      );
    }
  }, [code, language]);

  return (
    <pre className={`bg-zinc-900 text-zinc-100 p-4 rounded-md overflow-x-auto language-${language}`} tabIndex={0}>
      <code 
        className={`language-${language}`} 
        dangerouslySetInnerHTML={{ __html: highlightedCode }} 
      />
    </pre>
  );
}
