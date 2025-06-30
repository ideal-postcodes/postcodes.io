import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import React from "react";
import styles from "./index.module.css";
import HomepageDemos from "../components/Demos";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={clsx("hero__title")}>
          Postcode &amp; Geolocation API for the UK
        </Heading>
        <p
          className={clsx(
            "hero__subtitle",
            styles.tagline,
            "text--center",
            "margin-vert--lg"
          )}
        >
          {siteConfig.tagline}
        </p>
        <div className={clsx(styles.btnContainer, "margin-vert--lg")}>
          <div className={styles.buttons}>
            <iframe
              src="https://ghbtns.com/github-btn.html?user=ideal-postcodes&repo=postcodes.io&type=star&count=true&size=large"
              frameBorder="0"
              scrolling="0"
              width="170"
              height="30"
              title="GitHub"
            ></iframe>
          </div>
          <div className={styles.buttons}>
            <iframe
              src="https://ghbtns.com/github-btn.html?user=ideal-postcodes&repo=postcodes.io&type=fork&count=true&size=large"
              frameBorder="0"
              scrolling="0"
              width="170"
              height="30"
              title="GitHub"
            ></iframe>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Postcode & Geolocation API for the UK"
      description={siteConfig.tagline}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageDemos />
      </main>
    </Layout>
  );
}
