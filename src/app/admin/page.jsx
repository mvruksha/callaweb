import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import OrdersDashboard from "@/components/adminpage/dashboardpage/OrdersDashboard";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Admin = () => {
  return (
    <ProtectedRoute>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Dashboard"
      />
      <OrdersDashboard />
    </ProtectedRoute>
  );
};

export default Admin;
