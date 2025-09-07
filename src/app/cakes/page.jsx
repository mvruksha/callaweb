import ProductList from "@/components/cakemenu/ProductList";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Cakes = () => {
  return (
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Cakes Menu"
      />
      <ProductList />
    </>
  );
};

export default Cakes;
