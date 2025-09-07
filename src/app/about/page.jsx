import AboutUsSection from "@/components/aboutus/AboutUsSection";
import VideoPlayer from "@/components/aboutus/VideoPlayer";
import ImageGallery from "@/components/gallery/ImageGallery";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const About = () => {
  return (
    <>
      <Titletag url="/assets/titletag/banner1.jpg" parent="" title="About-Us" />
      <AboutUsSection />
      <ImageGallery />
      <div className="aspect-video w-full overflow-hidden">
        <VideoPlayer />
      </div>
    </>
  );
};

export default About;
