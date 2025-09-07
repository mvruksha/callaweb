import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import Image from "next/image";

const Titletag = ({ url = "", parent = "", title = "" }) => {
  return (
    <section className="relative mt-16 md:mt-20 lg:mt-8 xl:mt-8">
      <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden rounded-xl shadow-lg">
        {/* Background Image with gradient overlay */}
        <Image
          src={url}
          alt={title || "Page Banner"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        {/* Breadcrumb + Title */}
        <div className="absolute bottom-6 left-6 text-white space-y-3">
          {/* Breadcrumb */}
          <ul className="flex items-center space-x-2 text-sm md:text-base font-medium bg-white/10 px-4 py-2 rounded-b-2xl rounded-t-xs backdrop-blur-md shadow-md">
            <li>
              <Link href="/" className="hover:text-yellow-400 transition">
                Home
              </Link>
            </li>
            {parent && (
              <>
                <li>
                  <FaChevronRight className="text-gray-300 text-xs" />
                </li>
                <li>
                  <Link
                    href={`/${parent.toLowerCase()}`}
                    className="hover:text-yellow-400 transition"
                  >
                    {parent}
                  </Link>
                </li>
              </>
            )}
            <li>
              <FaChevronRight className="text-gray-300 text-xs" />
            </li>
            <li className="text-yellow-400 font-semibold">{title}</li>
          </ul>

          {/* Page Title */}
          <h1 className="text-2xl md:text-4xl font-bold tracking-wide drop-shadow-lg">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Titletag;
