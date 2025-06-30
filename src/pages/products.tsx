import React from "react";
import Layout from "@theme/Layout";
import ProductsDemo from "../components/Demos";

export default function Products(): React.JSX.Element {
  return (
    <Layout
      title="Products"
      description="Interactive demos of the Postcodes.io API endpoints"
    >
      <main>
        <ProductsDemo />
      </main>
    </Layout>
  );
}
