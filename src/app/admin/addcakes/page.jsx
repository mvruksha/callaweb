import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import AddCakeForm from "@/components/adminpage/cakespage/addcakespage/AddCakeForm";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const AddCakes = () => {
  return (
    <ProtectedRoute>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="admin"
        title="Cakes Board"
      />
      <AddCakeForm />
    </ProtectedRoute>
  );
};

export default AddCakes;
