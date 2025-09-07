import Titletag from "@/components/titletag/Titletag";
import TrackOrderPage from "@/components/trackorderpage/TrackOrderPage";
import React from "react";

const TrackOrder = () => {
  return (
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Track Your Order"
      />
      <TrackOrderPage />
    </>
  );
};

export default TrackOrder;
