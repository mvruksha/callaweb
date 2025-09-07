"use client";

import React, { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoMdAdd, IoMdClose, IoMdRemove } from "react-icons/io";
import { CartContext } from "../../../../contexts/CartContext";

const formatWeight = (weight) => {
  if (!weight) return "";
  if (weight.includes("/")) {
    const parts = weight.split(" ");
    const [num, den] = parts[0].split("/");
    const value = parseFloat(num) / parseFloat(den);
    return `${value} ${parts[1]}`;
  }
  return weight;
};

const CartItem = ({ item }) => {
  const { removeFromCart, increaseAmount, decreaseAmount } =
    useContext(CartContext);

  const {
    _id,
    id,
    title,
    image,
    selectedWeight,
    originalPrice,
    discountedPrice,
    amount,
  } = item;

  const productId = _id || id;

  return (
    <div className="flex gap-x-4 py-2 lg:px-6 border-b border-gray-400 px-4 w-full font-light text-gray-500 mb-1">
      <div className="w-full min-h-[150px] flex items-center gap-x-4">
        <Link href={`/product/${productId}`} className="shrink-0">
          <Image
            src={image}
            alt={title}
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>

        <div className="w-full flex flex-col gap-y-1">
          <div className="flex justify-between mb-2">
            <Link
              href={`/product/${productId}`}
              className="text-sm uppercase font-medium max-w-[240px] text-purple-700 hover:underline"
            >
              {title}{" "}
              <span className="text-gray-500 normal-case">
                ({formatWeight(selectedWeight)})
              </span>
            </Link>

            <button
              onClick={() => removeFromCart(productId, selectedWeight)}
              className="text-xl cursor-pointer"
            >
              <IoMdClose className="text-gray-500 hover:text-red-500 transition" />
            </button>
          </div>

          <div className="flex gap-x-2 h-[36px] text-sm">
            <div className="flex flex-1 max-w-[100px] items-center h-full border text-purple-700 font-medium">
              <button
                onClick={() => decreaseAmount(productId, selectedWeight)}
                className="h-full flex-1 flex justify-center items-center cursor-pointer"
              >
                <IoMdRemove />
              </button>
              <div className="h-full flex justify-center items-center px-2">
                {amount}
              </div>
              <button
                onClick={() => increaseAmount(productId, selectedWeight)}
                className="h-full flex flex-1 justify-center items-center cursor-pointer"
              >
                <IoMdAdd />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center items-center text-sm">
              <span className="text-purple-700 font-semibold">
                Rs {discountedPrice}
              </span>
              {originalPrice > discountedPrice && (
                <span className="line-through text-gray-400 text-xs">
                  Rs {originalPrice}
                </span>
              )}
            </div>

            <div className="flex flex-1 justify-end items-center text-purple-700 font-medium">
              Rs {(discountedPrice * amount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
