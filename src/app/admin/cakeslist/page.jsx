import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import CakesTable from "@/components/adminpage/cakespage/cakestablepage/CakesTable";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const CakeList = () => {
  return (
    <ProtectedRoute>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="admin"
        title="Cakes List"
      />
      <CakesTable />
    </ProtectedRoute>
  );
};

export default CakeList;
