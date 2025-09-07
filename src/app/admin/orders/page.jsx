import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import OrderTable from "@/components/adminpage/adminOrders/OrderTable";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Orders = () => {
  return (
    <ProtectedRoute>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="admin"
        title="Cake Orders"
      />
      <OrderTable />
    </ProtectedRoute>
  );
};

export default Orders;
