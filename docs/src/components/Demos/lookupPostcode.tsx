import React, { useState } from "react";
import styles from "./styles.module.css";

interface PostcodeData {
  status: number;
  result: {
    postcode: string;
    country: string;
    region: string;
    // Add more fields from the API response as needed
  };
}

const PostcodeLookup: React.FC = () => {
  const [postcode, setPostcode] = useState("");
  const [data, setData] = useState<PostcodeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
  };

  const fetchPostcodeData = async () => {
    try {
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data: PostcodeData = await response.json();
      setData(data);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      setData(null);
    }
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
        {error && <div>Error: {error}</div>}
        {data && (
          <div className={styles.result}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostcodeLookup;
