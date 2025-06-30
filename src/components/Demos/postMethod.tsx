import React, { useState, useEffect } from "react";
import { Code } from "../Code";
// @ts-ignore
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
  const [resultsVisible, setResultsVisible] = useState(true);
  const [editablePayload, setEditablePayload] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Initialize the editable payload with the provided payload
  useEffect(() => {
    setEditablePayload(JSON.stringify(payload, null, 2));
  }, [payload]);

  const fetchPostcodeData = async () => {
    const fullEndpoint = `https://${endpoint}`;

    try {
      let payload;
      try {
        payload = JSON.parse(editablePayload);
      } catch (parseError) {
        setApiResult(
          JSON.stringify({ error: "Invalid JSON payload" }, null, 2)
        );
        setHasSearched(true);
        return;
      }

      const response = await fetch(fullEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: editablePayload,
      });
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
      setHasSearched(true);
    } catch (error) {
      setApiResult(JSON.stringify({ error: "Request failed" }, null, 2));
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
          <button
            className="button button--primary button--lg"
            onClick={fetchPostcodeData}
          >
            Request
          </button>
        </div>
        <div className={styles.payloadContainer}>
          <div className={styles.payloadHeader}>
            <h4>Request Payload</h4>
            <button
              className={`button button--sm ${isEditing ? "button--primary" : "button--secondary"}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "View" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <textarea
              className={styles.jsonEditor}
              value={editablePayload}
              onChange={(e) => setEditablePayload(e.target.value)}
              rows={10}
            />
          ) : (
            <Code language="json" code={editablePayload} />
          )}
        </div>

        {hasSearched && (
          <>
            <button 
              className={styles.viewResultsButton}
              onClick={() => setResultsVisible(!resultsVisible)}
            >
              {resultsVisible ? 'Hide Results' : 'View Results'}
            </button>
            {resultsVisible && (
              <div className={styles.result}>
                <Code language="json" code={apiResult} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostMethod;
