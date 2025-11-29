"use client";

import React, { useContext, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartContext } from "../../../../contexts/CartContext";
import PhotoUploadBox from "./PhotoUploadBox";
import {
  IoArrowBack,
  IoBagCheckOutline,
  IoShieldCheckmarkOutline,
  IoCopyOutline,
} from "react-icons/io5";
import {
  FaSpinner,
  FaCheckCircle,
  FaRegEdit,
  FaTruck,
  FaHome,
} from "react-icons/fa";
import { FiPackage, FiUploadCloud } from "react-icons/fi";

// --- CONSTANTS ---
const SIZES = [
  { label: "Standard Sheet (No Extra)", value: "default", extra: 0 },
  { label: "Large A4 Print (+₹300)", value: "a4", extra: 300 },
  { label: "Extra Large A3 Print (+₹500)", value: "a3", extra: 500 },
];

const PHOTO_CAKE_CATEGORIES = ["photo print cake", "photo cake"];
const REFERENCE_IMAGE_CATEGORIES = [
  "fondant cake",
  "customized cake",
  "designer cake",
];

const CheckoutPage = () => {
  const { cart, itemAmount, clearCart, total } = useContext(CartContext);
  const router = useRouter();

  // --- STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    note: "",
  });

  const [customizationDetails, setCustomizationDetails] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null); // To store ID returned from backend
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- HELPER: Safe Category Extraction ---
  const getCategoryString = (category) => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (typeof category === "object" && category.name) return category.name;
    return "";
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleCustomizationChange = (itemId, field, value) => {
    setCustomizationDetails((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [field]: value },
    }));
    if (errors[`details_${itemId}`]) {
      setErrors((prev) => ({ ...prev, [`details_${itemId}`]: null }));
    }
  };

  // --- CALCULATIONS ---
  const { cartTotal, extraCharges, grandTotal } = useMemo(() => {
    let extra = 0;
    cart.forEach((item) => {
      const categoryName = getCategoryString(item.category).toLowerCase();
      const isPhotoCake = PHOTO_CAKE_CATEGORIES.some((cat) =>
        categoryName.includes(cat)
      );
      const details = customizationDetails[item._id] || {};

      if (isPhotoCake && details.size) {
        const sizeOption = SIZES.find((s) => s.value === details.size);
        if (sizeOption) extra += sizeOption.extra * item.amount;
      }
    });

    return {
      cartTotal: total,
      extraCharges: extra,
      grandTotal: total + extra,
    };
  }, [cart, total, customizationDetails]);

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";

    cart.forEach((item) => {
      const categoryName = getCategoryString(item.category).toLowerCase();
      const isPhotoCake = PHOTO_CAKE_CATEGORIES.some((cat) =>
        categoryName.includes(cat)
      );
      const details = customizationDetails[item._id] || {};

      if (isPhotoCake) {
        if (!details.imageUrl)
          newErrors[`details_${item._id}`] = "Please upload a photo.";
        if (!details.size) {
          /* Optional: enforce size selection */
        }
      }
    });

    return newErrors;
  };

  // --- SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    const orderPayload = {
      customer: formData,
      items: cart.map((item) => ({
        cakeId: item._id || item.id,
        title: item.title,
        category: getCategoryString(item.category),
        image: item.image,
        selectedWeight: item.selectedWeight || "Standard",
        selectedFlavor: item.selectedFlavor || "Standard",
        quantity: item.amount,
        price: item.price,
        customization: customizationDetails[item._id] || {},
      })),
      totals: {
        subtotal: cartTotal,
        extraCharges: extraCharges,
        grandTotal: grandTotal,
      },
      itemCount: itemAmount,
      status: "pending",
      paymentMethod: "COD", // <--- AUTO SET TO COD
    };

    try {
      const res = await fetch("https://callabackend.vercel.app/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to place order");
      }

      // Order Success
      setOrderId(responseData.orderId || responseData._id || "NEW-ORDER");
      clearCart();
      setOrderPlaced(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Order Error:", err);
      setErrors({
        submit: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- COMPONENT: ORDER SUCCESS UI ---
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full opacity-50"></div>

          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            {/* Confetti dots (simple CSS representation) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
              <span className="text-yellow-400 text-xl">✨</span>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            Order Successful!
          </h2>
          <p className="text-gray-500 mb-6">
            Yay! We have received your order. <br />
            You will receive a confirmation call shortly.
          </p>

          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 text-left">
            <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
              <span className="text-xs text-gray-500 uppercase font-bold">
                Order ID
              </span>
              <div className="flex items-center gap-1 text-purple-700 font-mono font-bold">
                #{orderId ? orderId.toString().slice(-6).toUpperCase() : "----"}
                <button className="text-gray-400 hover:text-gray-600">
                  <IoCopyOutline />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 uppercase font-bold">
                Payment Method
              </span>
              <span className="text-sm font-semibold text-gray-700">
                Cash on Delivery
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/trackorder"
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5"
            >
              <FaTruck /> Track Your Order
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 transition-colors"
            >
              <FaHome /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-purple-600 text-4xl" />
      </div>
    );
  }

  // --- MAIN CHECKOUT FORM ---
  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="p-2 bg-white rounded-full text-gray-500 hover:text-purple-600 shadow-sm transition-colors"
            >
              <IoArrowBack size={20} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <IoShieldCheckmarkOutline className="text-green-500 text-lg" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-gray-400 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Your cart is empty
            </h2>
            <Link
              href="/cakes"
              className="text-purple-600 hover:underline mt-2 inline-block"
            >
              Browse Cakes
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* --- LEFT COLUMN: DETAILS --- */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Contact & Address */}
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">
                    1
                  </span>
                  Delivery Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:bg-white ${
                        errors.name
                          ? "border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="Recipient Name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:bg-white ${
                        errors.phone
                          ? "border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="Mobile Number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:bg-white ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="Email Address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:bg-white ${
                        errors.address
                          ? "border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="House No, Street Name"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:bg-white ${
                        errors.city
                          ? "border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:bg-white ${
                        errors.pincode
                          ? "border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Order Note */}
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">
                    2
                  </span>
                  Instructions (Optional)
                </h2>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Message on cake, specific delivery instructions, etc."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* --- RIGHT COLUMN: SUMMARY --- */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => {
                    const categoryName = getCategoryString(
                      item.category
                    ).toLowerCase();
                    const isPhotoCake = PHOTO_CAKE_CATEGORIES.some((cat) =>
                      categoryName.includes(cat)
                    );
                    const isCustomCake = REFERENCE_IMAGE_CATEGORIES.some(
                      (cat) => categoryName.includes(cat)
                    );
                    const details = customizationDetails[item._id] || {};

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col gap-3 pb-6 border-b border-dashed border-gray-200 last:border-0 last:pb-0"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-bold">
                              x{item.amount}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                              {item.title}
                            </h3>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                {item.selectedWeight}
                              </span>
                              {item.selectedFlavor && (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                  {item.selectedFlavor}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-purple-700 mt-1">
                              ₹{(item.price * item.amount).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* --- PHOTO CAKE UPLOAD SECTION --- */}
                        {isPhotoCake && (
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-800 mb-2">
                              <FiUploadCloud /> Upload Photo for Cake
                            </div>
                            <PhotoUploadBox
                              required={true}
                              onChange={(url) =>
                                handleCustomizationChange(
                                  item._id,
                                  "imageUrl",
                                  url
                                )
                              }
                              previewUrl={details.imageUrl}
                            />
                            {errors[`details_${item._id}`] && (
                              <p className="text-red-500 text-[10px] mt-1 font-medium bg-red-50 px-2 py-1 rounded">
                                ⚠️ {errors[`details_${item._id}`]}
                              </p>
                            )}
                            <div className="mt-3">
                              <label className="text-[10px] font-bold text-gray-600 uppercase">
                                Select Print Size
                              </label>
                              <select
                                value={details.size || "default"}
                                onChange={(e) =>
                                  handleCustomizationChange(
                                    item._id,
                                    "size",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 text-xs border border-purple-200 rounded-md py-2 px-2 bg-white focus:outline-none focus:border-purple-500"
                              >
                                {SIZES.map((s, i) => (
                                  <option key={i} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* --- REFERENCE IMAGE SECTION --- */}
                        {isCustomCake && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1">
                            <p className="text-xs text-gray-500 mb-2">
                              Optional: Upload reference design
                            </p>
                            <PhotoUploadBox
                              required={false}
                              onChange={(url) =>
                                handleCustomizationChange(
                                  item._id,
                                  "imageUrl",
                                  url
                                )
                              }
                              previewUrl={details.imageUrl}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* --- TOTALS --- */}
                <div className="mt-8 space-y-3 pt-6 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {extraCharges > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span className="flex items-center gap-1">
                        <FaRegEdit size={12} /> Customization
                      </span>
                      <span className="font-medium">
                        +₹{extraCharges.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-200 mt-4">
                    <span className="font-bold text-gray-800 text-lg">
                      Total Amount
                    </span>
                    <div className="text-right">
                      <span className="block text-2xl font-extrabold text-purple-700">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Cash on Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- PLACE ORDER BUTTON --- */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <IoBagCheckOutline size={22} />
                  )}
                  {loading ? "Processing..." : `Place Order (COD)`}
                </button>

                {errors.submit && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center border border-red-100">
                    {errors.submit}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <IoShieldCheckmarkOutline /> 100% Safe & Secure
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
