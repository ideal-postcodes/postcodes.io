import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs";
import "prismjs/components/prism-json";

export interface Props {
  code: string;
  language: string;
}

export const Code = ({ code, language }: Props) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <pre style={{ maxWidth: '100%', display: 'block' }}>
      <code className={`language-${language}`} style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', display: 'block' }}>{code}</code>
    </pre>
  );
};
