"use client";

import React, { Component } from "react";
import Image from "next/image";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

export default class MainGallery extends Component {
  state = {
    cakes: [],
    selectedCakeIndex: null,
  };

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
      <div className="px-4 md:px-8 py-8 bg-gradient-to-b from-purple-50 to-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-purple-900 text-left">
          Cake Gallery
        </h2>

        {/* === Grid Layout with square images === */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cakes.map((cake, index) => (
            <div
              key={cake._id}
              className="relative cursor-pointer overflow-hidden rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 group"
              onClick={() => this.openModal(index)}
            >
              <Image
                src={cake.image}
                alt={cake.title}
                width={400}
                height={400}
                className="w-full aspect-square object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold text-center px-2">
                  {cake.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* === Modal Preview === */}
        {selectedCake && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
            onClick={this.closeModal}
          >
            {/* Top Bar with Count */}
            <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedCakeIndex + 1} / {cakes.length}
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold"
              onClick={this.closeModal}
            >
              &times;
            </button>

            {/* Main Image with Arrows */}
            <div className="relative flex items-center justify-center w-full max-w-4xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.modalPrev();
                }}
                className="absolute left-2 text-4xl text-white bg-purple-900 bg-opacity-60 p-3 rounded-full hover:bg-opacity-80 transition"
              >
                <IoMdArrowDropleft />
              </button>

              <Image
                src={selectedCake.image}
                alt={selectedCake.title}
                width={1000}
                height={1000}
                className="max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.modalNext();
                }}
                className="absolute right-2 text-4xl text-white bg-purple-900 bg-opacity-60 p-3 rounded-full hover:bg-opacity-80 transition"
              >
                <IoMdArrowDropright />
              </button>
            </div>

            {/* Caption */}
            <div className="text-white mt-4 text-center text-lg font-medium">
              {selectedCake.title}
            </div>

            {/* Thumbnail Row */}
            <div className="flex space-x-3 mt-6 overflow-x-auto px-2 py-2">
              {cakes.map((cake, index) => (
                <div
                  key={cake._id}
                  className={`cursor-pointer rounded-lg border-2 ${
                    index === selectedCakeIndex
                      ? "border-purple-400 scale-105"
                      : "border-transparent"
                  } transition-transform duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.openModal(index);
                  }}
                >
                  <Image
                    src={cake.image}
                    alt={cake.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
