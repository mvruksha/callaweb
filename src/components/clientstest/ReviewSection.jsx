"use client";

import Image from "next/image";
import { Quote } from "lucide-react";

const reviews = [
  {
    image: "/assets/reviews/client.jpg",
    name: "Ananya Sharma",
    location: "Indiranagar, Bangalore",
    review:
      "Call-A-Cake never disappoints! The chocolate truffle cake was heavenly, and the customization options made it perfect for my sister's birthday.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Rahul Verma",
    location: "Whitefield, Bangalore",
    review:
      "The bakery snacks are always fresh and delicious. I especially love their garlic cheese bread and sliders. Quality is top-notch!",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Priya Nair",
    location: "MG Road, Bangalore",
    review:
      "I ordered cupcakes for my office party, and they were a huge hit! Perfectly baked and beautifully presented. Highly recommend Call-A-Cake!",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Vikram Singh",
    location: "Koramangala, Bangalore",
    review:
      "Their mutton burgers and rolls are absolute perfection. Soft, juicy, and packed with flavor. Definitely my go-to snack spot now.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Sneha Reddy",
    location: "Hebbal, Bangalore",
    review:
      "I love the variety Call-A-Cake offers. From cakes to savory snacks, every item is fresh, delicious, and made with care.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Aditya Kulkarni",
    location: "Jayanagar, Bangalore",
    review:
      "Ordered a customized birthday cake, and it was perfect in taste and design. The delivery was prompt and the cake arrived fresh.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Riya Mehta",
    location: "Banaswadi, Bangalore",
    review:
      "The pastries and desserts here are absolutely amazing! Every bite is a delight. Their attention to quality really shows.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Karthik Rao",
    location: "Electronic City, Bangalore",
    review:
      "Call-A-Cake makes celebrations special. I ordered snacks for a corporate event, and everyone loved them. Fresh, tasty, and beautifully packaged.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Tanvi Joshi",
    location: "Bellandur, Bangalore",
    review:
      "Amazing experience! The chocolate fudge cake and garlic bread combo is unbeatable. Will definitely order again for my family gatherings.",
  },
  {
    image: "/assets/reviews/client.jpg",
    name: "Sameer Khan",
    location: "Kengeri, Bangalore",
    review:
      "Perfect bakery for every occasion! The quality, taste, and presentation are always consistent. Kudos to the team at Call-A-Cake!",
  },
];

const ReviewSection = () => {
  return (
    <section className="bg-[#fff5ff] py-12 px-4">
      <div className="max-w-8xl px-4 mx-auto text-center">
        {/* Section Title */}
        <div className="mb-8">
          <p className="text-purple-700 font-semibold text-sm sm:text-base">
            🍰 Freshly Baked, Always Delicious
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase font-bebas text-black">
            Hear It From Our Customers
          </h2>
        </div>

        {/* Horizontal Scroll Review Cards */}
        <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 py-2">
          <div className="flex gap-6 w-max">
            {reviews.map((item, index) => (
              <div
                key={index}
                className="snap-start min-w-[300px] max-w-[320px] bg-white shadow-xl rounded-xs p-6 transition-transform hover:scale-[1.05] duration-300"
              >
                <Quote className="text-purple-700 mb-3" size={24} />
                <p className="text-gray-800 text-sm leading-relaxed mb-5">
                  {item.review}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-left">
                    <h4 className="text-sm font-semibold uppercase text-gray-900">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500">{item.location}</p>
                  </div>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-purple-600 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
