import React from "react";
import Layout from "@theme/Layout";
import EndpointsDemo from "../components/Demos";

export default function Endpoints(): React.JSX.Element {
  return (
    <Layout
      title="Endpoints"
      description="Interactive demos of the Postcodes.io API endpoints"
    >
      <main>
        <EndpointsDemo />
      </main>
    </Layout>
  );
}
