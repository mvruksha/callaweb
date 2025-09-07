"use client";

import React, { useRef, useState, useEffect } from "react";
// ✅ Import new icons for "View" (FiEye) and "Close" (FiX)
import { FiUpload, FiEdit2, FiEye, FiX } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

const PhotoUploadBox = ({ onChange, previewUrl, required = false }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  // ✅ State to manage the visibility of the image modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // ✅ Handlers to open and close the modal
  const openModal = (e) => {
    e.stopPropagation(); // Prevent file dialog from opening
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // ✅ Effect to close the modal with the 'Escape' key for better accessibility
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("https://callabackend.vercel.app/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed. Server responded with an error.");
      }

      const data = await res.json();
      console.log("API Response Data:", data);

      if (data && data.url) {
        if (onChange) {
          onChange(data.url);
        }
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
      if (onChange) {
        onChange(null);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      {/* ✅ MODAL JSX: This will render on top of everything when isModalOpen is true */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closeModal} // Close modal when clicking the backdrop
        >
          <div
            className="relative bg-white p-2 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside the image frame
          >
            <img
              src={previewUrl}
              alt="Full size preview"
              className="block max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-red-600 transition-colors"
              aria-label="Close image view"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}

      <div
        onClick={handleClick}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all duration-300 group overflow-hidden ${
          required && !previewUrl
            ? "border-red-400 bg-red-50 hover:border-red-600"
            : "border-gray-400 bg-gray-50 hover:border-purple-600"
        } ${uploading ? "cursor-wait" : ""}`}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center text-slate-600">
            <FaSpinner className="animate-spin text-2xl mb-2" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-40">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-contain rounded-md z-0 bg-white"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center gap-x-6 transition-all duration-300 z-10">
              <div className="text-white opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity duration-300">
                <FiEdit2 />
                <span>Change</span>
              </div>

              {/* ✅ MODIFIED: This is now a button that opens the modal */}
              <button
                type="button"
                onClick={openModal}
                className="text-white opacity-0 group-hover:opacity-100 flex items-center gap-2 hover:underline transition-opacity duration-300"
              >
                <FiEye />
                <span>View</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FiUpload className="text-3xl text-gray-500 mb-2 group-hover:text-purple-600" />
            <p className="text-gray-600 text-sm text-center group-hover:text-purple-600">
              {required ? "Upload Photo *" : "Upload Photo"}
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhotoUploadBox;
