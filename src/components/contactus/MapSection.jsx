// MapSection.jsx
"use client";

import React from "react";

const MapSection = () => {
  return (
    <div className="w-full py-4 px-4 md:px-20 bg-gray-50">
      <h2 className="text-2xl font-bold text-start mb-8 text-purple-700">
        Our Location
      </h2>
      <div className="w-full h-96 md:h-[500px] rounded-xs overflow-hidden shadow-lg">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.2645003628168!2d77.48710097484113!3d12.954919387358922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3f000c0e92ad%3A0x6e420777d61eaaf3!2sCall%20A%20Cake!5e0!3m2!1sen!2sin!4v1756645194403!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-xs"
        ></iframe>
      </div>
    </div>
  );
};

export default MapSection;
