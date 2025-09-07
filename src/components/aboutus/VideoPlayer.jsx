"use client";
import React from "react";

const VideoPlayer = () => {
  return (
    <div className="w-full h-full ">
      <video
        className="w-full h-full object-cover"
        controls
        autoPlay
        muted
        playsInline
      >
        <source src="/assets/about/callacake.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
