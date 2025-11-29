"use client";

import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

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

const SlideTest = () => {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    mode: "snap",
    created(s) {
      setLoaded(true);
      s.moveToIdx(0, true, { duration: 0 });
    },
    dragStarted() {
      // Optional: Pause autoplay on drag
    },
  });

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
    // FIX: Changed 'mt' to 'pt' to avoid white gaps, and tuned spacing for the new headers
    <section className="relative pt-[110px] sm:pt-[115px] lg:pt-[125px] pb-4 group bg-purple-50/5">
      {/* Keen Slider container */}
      <div
        ref={sliderRef}
        // FIX: Increased mobile height slightly (200px -> 250px) for better visibility
        className="keen-slider h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] relative rounded-lg overflow-hidden shadow-lg mx-2 sm:mx-4"
      >
        {slides.map((slide, index) => (
          <div
            key={`${slide.Link}-${index}`}
            className="keen-slider__slide relative"
          >
            {/* Clickable Image Area */}
            <Link href={slide.Link} className="block w-full h-full">
              <figure className="h-full w-full relative">
                <Image
                  src={slide.img}
                  alt={slide.title}
                  fill
                  quality={100}
                  priority={index === 0} // Load first image faster
                  className="object-cover"
                />
              </figure>

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>

              {/* Content */}
              <div
                className="absolute left-4 sm:left-10 md:left-16 top-1/2 -translate-y-1/2 
                w-[70%] sm:w-1/2 md:w-[45%] lg:w-[40%]
                text-white drop-shadow-lg z-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 leading-tight tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium opacity-90 mb-4 line-clamp-2">
                  {slide.des}
                </p>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(slide.Link);
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 
                  hover:from-pink-600 hover:to-purple-700 
                  text-white px-5 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg
                  transition-all duration-300 transform hover:scale-105 hover:shadow-pink-500/25
                  text-xs sm:text-sm font-semibold"
                >
                  Order Now
                  <IoIosArrowForward className="text-sm" />
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Custom Left & Right Buttons - Only show after load to prevent layout shift */}
      {loaded && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              instanceRef.current?.prev();
            }}
            className="absolute left-4 sm:left-8 top-[55%] -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white backdrop-blur-sm border border-white/30 text-white hover:text-purple-700 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
          >
            <FaChevronLeft className="text-sm sm:text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              instanceRef.current?.next();
            }}
            className="absolute right-4 sm:right-8 top-[55%] -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white backdrop-blur-sm border border-white/30 text-white hover:text-purple-700 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
          >
            <FaChevronRight className="text-sm sm:text-lg" />
          </button>
        </>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-4 left-0 w-full px-2 sm:px-4">
        <div className="w-full h-1 bg-gray-200/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default SlideTest;
