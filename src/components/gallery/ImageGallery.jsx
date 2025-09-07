"use client";

import { useState } from "react";
import Image from "next/image";

const images = [
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1756647369/1_fc1ag7.jpg",
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1756647370/2_wa8tfa.jpg",
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1756647374/3_dkgk4b.jpg",
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1756647370/4_qao29o.jpg",
];

export default function ImageGallery() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-4">
      {/* Grid for images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((src, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => setSelected(src)}
          >
            <Image
              src={src}
              alt={`Image ${index + 1}`}
              width={300}
              height={200}
              className="rounded-xs object-cover"
            />
          </div>
        ))}
      </div>

      {/* Fullscreen modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-[90%] h-[90%]">
            <Image
              src={selected}
              alt="Selected"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
