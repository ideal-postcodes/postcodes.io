import React, { useState } from "react";
import { Code } from "../Code";
// @ts-ignore
import styles from "./styles.module.css";

interface PostcodeLookupProps {
  endpointTemplate: string;
  linkEnd: string;
  headingText: string;
  placeholder: string;
  defaultPostcode?: string;
}

const GetPostcode: React.FC<PostcodeLookupProps> = ({
  endpointTemplate,
  linkEnd,
  headingText,
  placeholder,
  defaultPostcode = "",
}) => {
  const [postcode, setPostcode] = useState<string>(defaultPostcode);
  const [apiResult, setApiResult] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(true);

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
  };

  const fetchPostcodeData = async () => {
    const encodedPostcode = encodeURIComponent(postcode);
    const endpoint = `https://${endpointTemplate}${encodedPostcode}${linkEnd}`;
    try {
      const response = await fetch(endpoint);
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
        <h3 className={styles.endpointLabel}>{headingText}</h3>
        <div className={styles.requestContainer}>
          <span className={styles.httpMethod}>GET</span>
          <p className={styles.request}>{endpointTemplate}</p>
          <input
            className={styles.postcodeInput}
            type="text"
            value={postcode}
            onChange={handlePostcodeChange}
            placeholder={placeholder}
          />
          <p className={styles.request}>{linkEnd}</p>
          <button
            className="button button--primary button--lg"
            onClick={fetchPostcodeData}
          >
            Request
          </button>
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

export default GetPostcode;
