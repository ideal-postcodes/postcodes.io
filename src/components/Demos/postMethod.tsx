import React, { useState } from "react";
import { Code } from "../Code";
import styles from "./styles.module.css";

interface PostMethodProps {
  headerText: string;
  payload: any;
  endpoint: string;
}

const PostMethod: React.FC<PostMethodProps> = ({
  headerText,
  payload,
  endpoint,
}) => {
  const [apiResult, setApiResult] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchPostcodeData = async () => {
    const fullEndpoint = `https://${endpoint}`;

    try {
      const response = await fetch(fullEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
      setHasSearched(true);
    } catch (error) {
      setHasSearched(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.endpointContainer}>
        <h3 className={styles.endpointLabel}>{headerText}</h3>
        <div className={styles.requestContainer}>
          <span className={styles.httpMethod}>POST</span>
          <p className={styles.request}>{endpoint}</p>
          <button onClick={fetchPostcodeData}>Request</button>
        </div>
        <Code language="json" code={JSON.stringify(payload, null, 2)} />
        {hasSearched && (
          <div className={styles.result}>
            <Code language="json" code={apiResult} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostMethod;
