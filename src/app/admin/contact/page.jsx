import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import ContactsTable from "@/components/adminpage/contactadmin/ContactsTable";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const ContactAdmin = () => {
  return (
    <ProtectedRoute>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Contact Table"
      />
      <ContactsTable />
    </ProtectedRoute>
  );
};

export default ContactAdmin;
