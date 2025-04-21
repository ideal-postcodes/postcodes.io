import React, { useState } from "react";
import styles from "./styles.module.css";

interface PostcodeLookupProps {
  endpointTemplate: string;
  headingText: string;
  longPlaceholder: string;
  latPlaceholder: string;
}

const GetGeocode: React.FC<PostcodeLookupProps> = ({
  endpointTemplate,
  headingText,
  longPlaceholder,
  latPlaceholder,
}) => {
  const [longitude, setLongitude] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [apiResult, setApiResult] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [fullEndpoint, setFullEndpoint] = useState<string>("");

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(e.target.value);
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(e.target.value);
  };

  const fetchPostcodeData = async () => {
    const encodedLongitude = encodeURIComponent(longitude);
    const encodedLatitude = encodeURIComponent(latitude);
    const endpoint = `https://${endpointTemplate}?lon=${encodedLongitude}&lat=${encodedLatitude}`;
    setFullEndpoint(endpoint);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
      setHasSearched(true);
      console.log(endpoint);
    } catch (error) {
      setHasSearched(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.endpointContainer}>
        <h3 className={styles.endpointLabel}>{headingText}</h3>
        <div className={styles.requestContainer}>
          <span className={styles.httpMethod}>GET</span>
          <p className={styles.request}>{endpointTemplate}?lon=</p>
          <input
            className={styles.postcodeInput}
            type="text"
            value={longitude}
            onChange={handleLongitudeChange}
            placeholder={longPlaceholder}
          />
          <p className={styles.request}>&lat=</p>
          <input
            className={styles.postcodeInput}
            type="text"
            value={latitude}
            onChange={handleLatitudeChange}
            placeholder={latPlaceholder}
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

export default GetGeocode;
