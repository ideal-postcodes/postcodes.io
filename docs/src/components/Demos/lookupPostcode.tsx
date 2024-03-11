import React, { useState } from "react";
import styles from "./styles.module.css";

const PostcodeLookup: React.FC = () => {
  const [postcode, setPostcode] = useState("");
  const [apiResult, setApiResult] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
  };

  const fetchPostcodeData = async () => {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
    );
    const data = await response.json();
    setApiResult(JSON.stringify(data, null, 2));
    setHasSearched(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.endpointContainer}>
        <h3 className={styles.endpointLabel}>Lookup a Postcode</h3>
        <div className={styles.requestContainer}>
          <p className={styles.request}>api.postcodes.io/postcodes/</p>
          <input
            className={styles.postcodeInput}
            type="text"
            value={postcode}
            onChange={handlePostcodeChange}
            placeholder=":postcode"
          />
          <button onClick={fetchPostcodeData}>Request</button>
        </div>
        {hasSearched && (
          <div className={styles.result}>
            <pre>{apiResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostcodeLookup;
