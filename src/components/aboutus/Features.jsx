import React from "react";
import { MdDeliveryDining } from "react-icons/md";
import { FaBirthdayCake, FaGift } from "react-icons/fa";
import { PiShoppingBagOpenFill } from "react-icons/pi";
import { GiCupcake } from "react-icons/gi";

const FeatureCard = ({ Icon, title, subtitle }) => (
  <div className="flex items-center space-x-4 transition-transform duration-300 hover:scale-105">
    <div className="p-4 bg-gray-50 rounded-xs shadow-xl">
      <Icon className="text-4xl text-purple-700" />
    </div>
    <div className="text-left">
      <h1 className="text-lg sm:text-lg md:text-lg lg:text-lg xl:text-lg 2xl:text-xl font-bebas font-bold">
        {title}
      </h1>
      <p className="text-sm text-gray-700">{subtitle}</p>
    </div>
  </div>
);

export default function Features() {
  return (
    <section className="py-10 bg-white text-black">
      <div className="flex justify-center items-center mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full px-4">
          <FeatureCard
            Icon={MdDeliveryDining}
            title="QUICK DELIVERY"
            subtitle="Cakes delivered within 60 mins"
          />

          <FeatureCard
            Icon={FaBirthdayCake}
            title="CUSTOM CAKES"
            subtitle="Personalized designs & flavors"
          />

          <FeatureCard
            Icon={FaGift}
            title="CELEBRATION READY"
            subtitle="Perfect for birthdays & events"
          />

          <FeatureCard
            Icon={GiCupcake}
            title="FRESHLY BAKED"
            subtitle="Made daily with love"
          />
        </div>
      </div>
    </section>
  );
}
