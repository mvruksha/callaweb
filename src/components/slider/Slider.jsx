"use client";

import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io"; // ✅ import arrow icon

const slides = [
  {
    Link: "/categories/Regular%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755875839/banner_cala_tledjz.jpg",
    title: "Delight in Every Bite",
    des: "Regular Cakes – Classic flavors baked fresh for every occasion.",
  },
  {
    Link: "/categories/Photo%20Print%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755875960/bann_a2maac.jpg",
    title: "Preparing with Love",
    des: "Every cake is crafted with care, passion & sweetness.",
  },
  {
    Link: "/categories/Fondant%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755875738/banner_cala_1_at4fya.jpg",
    title: "Art You Can Eat",
    des: "Fondant Cakes – Elegant designs with rich taste.",
  },
  {
    Link: "/categories/Customized%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755874135/banner2_vk01et.jpg",
    title: "Made Just for You",
    des: "Customized Cakes – Designed to match your theme & style.",
  },
  {
    Link: "/categories/Regular%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755874129/banner3_dwknxc.jpg",
    title: "Celebrate Everyday",
    des: "Regular Cakes – Fresh, soft & full of happiness.",
  },
  {
    Link: "/categories/Photo%20Print%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755874128/banner4_yd3tvu.jpg",
    title: "Edible Memories",
    des: "Photo Print Cakes – Unique & personalized sweetness.",
  },
  {
    Link: "/categories/Fondant%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755874568/banner_cala_rqfqqw.jpg",
    title: "Designed with Love",
    des: "Fondant Cakes – Creative, colorful & delicious artistry.",
  },
  {
    Link: "/categories/Customized%20Cake",
    img: "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755874127/banner6_zmqaqx.jpg",
    title: "Your Cake, Your Way",
    des: "Customized Cakes – Perfectly crafted to your imagination.",
  },
];

const Slider = () => {
  const router = useRouter();
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    mode: "snap",
    created(s) {
      setLoaded(true);
      s.moveToIdx(0, true, { duration: 0 });
    },
  });

  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // Autoplay with progress bar
  useEffect(() => {
    if (!instanceRef.current) return;

    let timeout;
    let progressInterval;

    const startAutoplay = () => {
      timeout = setInterval(() => {
        instanceRef.current?.next();
      }, 4000);

      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2.5));
      }, 100);
    };

    const stopAutoplay = () => {
      clearInterval(timeout);
      clearInterval(progressInterval);
    };

    startAutoplay();
    instanceRef.current.on("dragStarted", stopAutoplay);
    instanceRef.current.on("animationEnded", () => {
      stopAutoplay();
      setProgress(0);
      startAutoplay();
    });

    return () => stopAutoplay();
  }, [instanceRef]);

  return (
    <section className="relative mt-20 group">
      {/* Keen Slider container */}
      <div
        ref={sliderRef}
        className="keen-slider sm:h-[350px] h-[200px] relative rounded-xs overflow-hidden"
      >
        {slides.map((slide, index) => (
          <div
            key={`${slide.Link}-${index}`}
            className="keen-slider__slide relative"
          >
            {/* ✅ Only ONE Link wrapper */}
            <Link href={slide.Link}>
              <figure className="h-full w-full">
                <Image
                  src={slide.img}
                  alt={slide.title}
                  fill
                  quality={100}
                  className="object-cover"
                />
              </figure>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

              {/* Content */}
              <div
                className="absolute ml-2 left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 
               w-[50%] sm:w-1/3 md:w-1/3 lg:w-1/3
               text-white drop-shadow-md"
              >
                <h2 className="md:text-4xl lg:text-6xl xl:text-6xl 2xl:text-6xl text-2xl sm:text-2xl font-extrabold mb-1 leading-tight">
                  {slide.title}
                </h2>
                <p className="md:text-base text-[12px] sm:text-sm font-medium opacity-90 mb-2">
                  {slide.des}
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent outer Link conflict
                    router.push(slide.Link);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r mt-3 
                 from-pink-500 to-purple-700 
                 hover:from-pink-600 hover:to-purple-800 
                 text-white px-4 py-2 rounded-xs shadow-lg
                 transition transform hover:scale-105 
                 text-[10px] sm:text-sm cursor-pointer"
                >
                  Order Now
                  <IoIosArrowForward className="text-xs sm:text-sm" />
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Custom Left & Right Buttons */}
      {loaded && (
        <>
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xs flex items-center justify-center bg-white/70 hover:bg-purple-800 text-purple-600 hover:text-white transition opacity-0 group-hover:opacity-100 z-10"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xs flex items-center justify-center bg-white/70 hover:bg-purple-800 text-purple-600 hover:text-white transition opacity-0 group-hover:opacity-100 z-10"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
        <div
          className="h-1 bg-pink-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </section>
  );
};

export default Slider;
