import clsx from "clsx";
//@ts-ignore
import styles from "./styles.module.css";
import React from "react";

export default function CallToAction(): React.JSX.Element {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row">
          <div className="col col--6 d-flex align-items-center">
            <div>
              <h2 className={styles.header}>When Your Project Demands More</h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  marginBottom: "1rem",
                  color: "#666",
                }}
              >
                Postcodes.io is our free and reliable tool for UK postcode
                lookup and geocoding.
              </p>
              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  marginBottom: "2rem",
                  color: "#666",
                }}
              >
                When you need broader coverage, fresher and more detailed
                address data, and expert support, Ideal Postcodes is built for
                high-demand applications.
              </p>
              <div className={styles.ctaButton}>
                <a
                  href="https://ideal-postcodes.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary button--lg"
                >
                  Explore Ideal Postcodes
                </a>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.card}>
              <ul className={styles.tickList}>
                <p className={styles.cardTitle}>
                  What you get with Ideal Postcodes
                </p>
                <li>
                  Whole United Kingdom &amp; territories, international datasets
                </li>
                <li>Rooftop Geocodes and UPRNs on every search</li>
                <li>Property level precision</li>
                <li>
                  Updated daily from Royal Mail, Ordnance Survey and other UK
                  data providers
                </li>
                <li>Dedicated Support</li>
              </ul>
            </div>
            <div className={styles.ctaMobileButton}>
              <a
                href="https://ideal-postcodes.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="button button--primary button--lg"
              >
                Explore Ideal Postcodes
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
