"use client";

import Image from "next/image";
import Link from "next/link";

const AboutUsSection = () => {
  return (
    <section className="bg-[#FFF9F5] py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left Side Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4 font-bebas">
            About Call-A-Cake
          </h2>
          <p className="text-gray-700 text-md md:text-lg mb-6 leading-relaxed">
            With over{" "}
            <span className="font-semibold text-purple-600">
              10 years of baking excellence
            </span>
            , Call-A-Cake is your trusted destination for delicious treats,
            snacks, and desserts. From freshly baked cakes to savory burgers and
            customized delights, we bring{" "}
            <span className="font-semibold">flavor, quality, and joy</span> to
            every bite.
          </p>
          <p className="text-gray-700 text-md md:text-lg mb-6 leading-relaxed">
            Whether it's a corporate event, a birthday celebration, or a simple
            craving at home, our{" "}
            <span className="font-semibold">customized baked goods</span> and
            reliable home delivery make every occasion special.
          </p>
          <Link
            href="/cakes"
            className="inline-block bg-purple-800 text-white font-semibold px-6 py-3 rounded-xs shadow-lg hover:bg-purple-900 transition"
          >
            Explore Our Cakes
          </Link>
        </div>

        {/* Right Side Image */}
        <div className="md:w-1/2 relative w-full h-[300px] md:h-[400px] lg:h-[450px]">
          <Image
            src="/assets/logo/calalogo.png"
            alt="Call-A-Cake Delights"
            fill
            className="object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
