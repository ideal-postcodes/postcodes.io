import React from "react";
import Layout from "@theme/Layout";
import HomepageDemos from "../components/Demos";

export default function Products(): JSX.Element {
  return (
    // @ts-expect-error Temporary suppress for Docusaurus component types
    <Layout
      title="Products"
      description="Interactive demos of the Postcodes.io API endpoints"
    >
      <main>
        <HomepageDemos />
      </main>
    </Layout>
  );
}
