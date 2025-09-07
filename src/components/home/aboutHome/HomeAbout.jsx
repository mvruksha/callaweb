import Link from "next/link";
import React from "react";
import Image from "next/image";

const homeProduct = [
  {
    Link: "/categories/Regular%20Cake",
    title: "Regular Cakes",
    image:
      "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755878214/Untitled_design_izht13.png",
  },
  {
    Link: "/categories/Photo%20Print%20Cake",
    title: "Photo print Cakes",
    image:
      "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755880529/home_about_1_q8hkxf.png",
  },
  {
    Link: "/categories/Fondant%20Cake",
    title: "Fondent Cake",
    image:
      "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755881695/foundent_hrq9md.png",
  },
  {
    Link: "/categories/Customized%20Cake",
    title: "Customized cake",
    image:
      "https://res.cloudinary.com/dsndb5cfm/image/upload/v1755881391/doll_myqxqp.png",
  },
];

const HomeAbout = () => {
  return (
    <section className="grid grid-cols-2 gap-3 p-3 w-full mx-auto">
      {homeProduct.map((item) => (
        <Link
          href={item.Link}
          className="relative shadow-lg hover:shadow-xl group"
          key={item.title} // ✅ unique & stable key
        >
          <div className="md:h-[400px] max-md:aspect-square overflow-hidden">
            <Image
              src={item.image}
              width={400}
              height={400}
              alt={item.title}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
            />

            {/* Title on hover */}
            <div className="absolute bottom-0 left-0 w-full bg-black/80 text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.title}
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default HomeAbout;
