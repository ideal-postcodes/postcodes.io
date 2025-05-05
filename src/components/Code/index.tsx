import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs";
import "prismjs/components/prism-json";
// import "prismjs/themes/prism-okaidia.css";

export interface Props {
  code: string;
  language: string;
}

export const Code = ({ code, language }: Props) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <pre>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};
