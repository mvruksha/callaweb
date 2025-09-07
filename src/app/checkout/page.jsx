import CheckoutPage from "@/components/cakemenu/checkoutpage/CheckoutPage";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Checkout = () => {
  return (
    <>
      {/* Banner */}
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="cart"
        title="CheckOut"
      />
      <CheckoutPage />
    </>
  );
};

export default Checkout;
