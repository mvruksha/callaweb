import CakeGallery from "@/components/gallery/CakeGallery";
import MainGallery from "@/components/gallery/MainGallery";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Gallery = () => {
  return (
    <>
      {/* Banner */}
      <Titletag url="/assets/titletag/banner1.jpg" parent="" title="Gallery" />
      <MainGallery />
      <CakeGallery />
    </>
  );
};

export default Gallery;
