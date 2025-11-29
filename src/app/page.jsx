"use client";

import React, { useContext } from "react";
import HomeAbout from "@/components/home/aboutHome/HomeAbout";
import ProductSlider from "@/components/home/slider/ProductSlider";
import Slider from "@/components/slider/Slider";
import CakeGallery from "@/components/gallery/CakeGallery";
import VideoPlayer from "@/components/aboutus/VideoPlayer";
import Features from "@/components/aboutus/Features";
import ReviewSection from "@/components/clientstest/ReviewSection";

export default function Home() {
  return (
    <>
      <Slider />
      <HomeAbout />
      <ProductSlider />
      <div className="aspect-video w-full overflow-hidden">
        <VideoPlayer />
      </div>
      <Features />
      <ReviewSection />
      <CakeGallery />
    </>
  );
}
