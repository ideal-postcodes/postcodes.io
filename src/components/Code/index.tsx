import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";

export interface Props {
  code: string;
  language: string;
}

export const Code = ({ code, language }: Props) => {
  const { colorMode } = useColorMode();
  const theme = colorMode === "dark" ? themes.vsDark : themes.vsLight;

  return (
    <div className={styles.codeContainer}>
      <Highlight code={code} language={language} theme={theme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} ${styles.codeBlock}`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className={styles.lineNumber}>{i + 1}</span>
                <span className={styles.lineContent}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};
