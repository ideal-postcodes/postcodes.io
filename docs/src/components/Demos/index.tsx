import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import PostcodeLookup from "./lookupPostcode";

export default function HomepageDemos(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>API Endpoint & Methods</h2>
        </div>
        <div>
          <PostcodeLookup />
        </div>
      </div>
    </section>
  );
}
