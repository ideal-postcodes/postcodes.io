import React, { useState } from "react";
import styles from "./styles.module.css";

const PostMethod: React.FC = () => {
  const [apiResult, setApiResult] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  const postcodesPayload = {
    postcodes: ["OX49 5NU", "M32 0JG", "NE30 1DP"],
  };
  const endpoint = "api.postcodes.io/postcodes";

  const fetchPostcodeData = async () => {
    const fullEndpoint = "https://api.postcodes.io/postcodes";

    try {
      const response = await fetch(fullEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postcodesPayload),
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
        <h3 className={styles.endpointLabel}>Bulk Postcode Lookup</h3>
        <div className={styles.requestContainer}>
          <span className={styles.httpMethod}>POST</span>
          <p className={styles.request}>{endpoint}</p>
          <button onClick={fetchPostcodeData}>Request</button>
        </div>
        <pre className={styles.payload}>
          {JSON.stringify(postcodesPayload, null, 2)}
        </pre>
        {hasSearched && (
          <div className={styles.result}>
            <pre>{apiResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostMethod;
