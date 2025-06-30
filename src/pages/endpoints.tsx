import React from "react";
import Layout from "@theme/Layout";
import EndpointsDemo from "../components/Demos";
import styles from "./endpoints.module.css";

function EndpointsHero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center">
            <h1 className={styles.heroTitle}>API Endpoints</h1>
            <p className={styles.heroSubtitle}>
              Interactive demos and live testing for all Postcodes.io API endpoints.
              Try real requests and see responses in real-time.
            </p>
            <div className={styles.heroActions}>
              <a
                href="/docs/overview"
                className="button button--secondary button--lg"
              >
                📖 Documentation
              </a>
              <a
                href="/docs/api"
                className="button button--primary button--lg"
              >
                📋 API Reference
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Endpoints(): React.JSX.Element {
  return (
    <Layout
      title="Endpoints"
      description="Interactive demos of the Postcodes.io API endpoints"
    >
      <main>
        <EndpointsHero />
        <EndpointsDemo />
      </main>
    </Layout>
  );
}
