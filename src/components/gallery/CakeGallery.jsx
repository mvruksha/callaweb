"use client";

import React, { Component } from "react";
import Image from "next/image";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

export default class CakeGallery extends Component {
  state = {
    cakes: [],
    selectedCakeIndex: null,
  };

  scrollRef = React.createRef();

  componentDidMount() {
    fetch("https://callabackend.vercel.app/api/cakes")
      .then((res) => res.json())
      .then((data) => this.setState({ cakes: data }))
      .catch((err) => console.error("Error fetching cakes:", err));
  }

  openModal = (index) => {
    this.setState({ selectedCakeIndex: index });
  };

  closeModal = () => {
    this.setState({ selectedCakeIndex: null });
  };

  scrollLeft = () => {
    if (this.scrollRef.current) {
      this.scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  scrollRight = () => {
    if (this.scrollRef.current) {
      this.scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  modalPrev = () => {
    this.setState((prev) => ({
      selectedCakeIndex:
        (prev.selectedCakeIndex - 1 + prev.cakes.length) % prev.cakes.length,
    }));
  };

  modalNext = () => {
    this.setState((prev) => ({
      selectedCakeIndex: (prev.selectedCakeIndex + 1) % prev.cakes.length,
    }));
  };

  render() {
    const { cakes, selectedCakeIndex } = this.state;
    const selectedCake =
      selectedCakeIndex !== null ? cakes[selectedCakeIndex] : null;

    return (
      <div className="px-4 md:px-10 py-8 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-start text-purple-900">
          Cake Gallery
        </h2>

        {/* Horizontal Slider */}
        <div className="relative">
          <button
            onClick={this.scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-200 transition-all"
          >
            <IoMdArrowDropleft className="text-3xl text-purple-800" />
          </button>

          <div
            ref={this.scrollRef}
            className="flex overflow-x-auto space-x-6 scroll-smooth snap-x snap-mandatory px-2 md:px-10 hide-scrollbar"
          >
            {cakes.map((cake, index) => (
              <div
                key={cake._id}
                className="flex-none w-64 sm:w-72 md:w-80 cursor-pointer rounded-xs overflow-hidden shadow-lg relative group snap-start transition-transform hover:scale-105"
                onClick={() => this.openModal(index)}
              >
                <Image
                  src={cake.image}
                  alt={cake.title}
                  width={400}
                  height={400}
                  className="w-full h-56 sm:h-60 md:h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-purple-950 bg-opacity-70 text-white p-3 text-center">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {cake.title}
                  </h3>
                  {/* FIX APPLIED HERE */}
                  {cake?.prices?.["1 Kg"]?.discountedPrice && (
                    <p className="text-xs sm:text-sm">
                      ₹{cake.prices["1 Kg"].discountedPrice}{" "}
                      <span className="line-through text-gray-300">
                        ₹{cake.prices["1 Kg"].originalPrice}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={this.scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-200 transition-all"
          >
            <IoMdArrowDropright className="text-3xl text-purple-800" />
          </button>
        </div>

        {/* Modal Preview */}
        {selectedCake && (
          <div
            className="fixed inset-0 bg-purple-950 bg-opacity-80 flex items-center justify-center z-50 p-4 md:p-8"
            onClick={this.closeModal}
          >
            <div
              className="bg-white rounded-xs overflow-hidden w-full max-w-3xl flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="relative w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center bg-gray-100">
                <button
                  onClick={this.modalPrev}
                  className="absolute left-2 text-3xl text-purple-800 bg-white p-1 rounded-full shadow-lg hover:bg-gray-200 z-10 transition"
                >
                  <IoMdArrowDropleft />
                </button>

                <Image
                  src={selectedCake.image}
                  alt={selectedCake.title}
                  width={800}
                  height={800}
                  className="object-cover w-full h-64 md:h-full"
                />

                <button
                  onClick={this.modalNext}
                  className="absolute right-2 text-3xl text-purple-800 bg-white p-1 rounded-full shadow-lg hover:bg-gray-200 z-10 transition"
                >
                  <IoMdArrowDropright />
                </button>
              </div>

              {/* Details Section */}
              <div className="p-6 w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
                <button
                  className="absolute top-4 right-4 text-gray-700 text-3xl font-bold md:hidden"
                  onClick={this.closeModal}
                >
                  &times;
                </button>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {selectedCake.title}
                </h3>
                <p className="mb-4 text-gray-600">{selectedCake.description}</p>

                {/* FIX APPLIED HERE */}
                {selectedCake?.prices?.["1 Kg"]?.discountedPrice && (
                  <p className="text-xl md:text-2xl font-semibold text-purple-900">
                    ₹{selectedCake.prices["1 Kg"].discountedPrice}{" "}
                    <span className="line-through text-gray-400">
                      ₹{selectedCake.prices["1 Kg"].originalPrice}
                    </span>
                  </p>
                )}
              </div>

              {/* Close button for desktop */}
              <button
                className="absolute top-4 right-4 text-gray-700 text-3xl font-bold hidden md:block"
                onClick={this.closeModal}
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
