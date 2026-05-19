'use client';

import { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const highlightedCode = useMemo(() => {
    try {
      const grammar = Prism.languages[language] || Prism.languages.markup;
      return Prism.highlight(code, grammar, language);
    } catch (e) {
      return code; // fallback
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
