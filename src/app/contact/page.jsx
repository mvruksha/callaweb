import ContactSection from "@/components/contactus/ContactSection";
import MapSection from "@/components/contactus/MapSection";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Contact = () => {
  return (
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Contact-Us"
      />
      <ContactSection />
      <MapSection />
    </>
  );
};

export default Contact;
