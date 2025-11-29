import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import CTable from "@/components/adminpage/cakespage/cakestablepage/CTable";
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
      <CTable />
    </ProtectedRoute>
  );
};

export default CakeList;
