import React, { useState } from "react";
import PropTypes from "prop-types";

const ProductDetails = ({ product, onClose, hidePostedBy }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Array of images including the main image and additional images if they exist
  const images = [product.image];
  if (product.additionalImage1) images.push(product.additionalImage1);
  if (product.additionalImage2) images.push(product.additionalImage2);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="fixed inset-0 z-20 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-3/4 h-3/4 p-4 flex relative rounded-lg">
        {/* Left side: Product Image */}
        <div className="w-2/3 flex justify-center items-center relative border-r-2 border-gray-400">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="h-full object-contain"
          />

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black text-2xl"
            >
              ❮
            </button>
          )}

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black text-2xl"
            >
              ❯
            </button>
          )}
        </div>

        {/* Right side: Product Details */}
        <div className="w-1/3 p-4 flex flex-col">
          {/* Product Name and Divider */}
          <div>
            <h2 className="text-3xl mb-2">
              <span className="text-black font-bold">{product.name}</span>
            </h2>
            <hr className="border-gray-300 my-2" />
          </div>

          {/* Description Box */}
          <div className="flex-grow overflow-y-auto mb-4">
            <p className="text-lg text-gray-600">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Remaining Details */}
          <div>
            {!hidePostedBy && (
              <p className="text-sm text-gray-600 mb-2">
                Posted by:{" "}
                {product?.postedBy?.userId?.username || "Unknown User"}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-2">
              Used by: {product.purchaseDateMonth}/{product.purchaseDateYear}
            </p>
            <p className="text-sm text-gray-600 mb-2 w-fit">
              Likes: {product.likes.length} ❤️
            </p>
          </div>

          {/* Close Button */}
          <button
            className="absolute top-0 right-0 text-gray-500 hover:text-white text-2xl hover:bg-red-400 rounded-md"
            onClick={onClose}
          >
            ❌
          </button>
        </div>
      </div>
    </div>
  );
};

ProductDetails.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired, // Main image
    additionalImage1: PropTypes.string, // Additional image 1
    additionalImage2: PropTypes.string, // Additional image 2
    price: PropTypes.number.isRequired,
    purchaseDateMonth: PropTypes.string.isRequired,
    purchaseDateYear: PropTypes.string.isRequired,
    postedBy: PropTypes.shape({
      username: PropTypes.string,
    }).isRequired,
    likes: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  hidePostedBy: PropTypes.bool,
};

export default ProductDetails;
