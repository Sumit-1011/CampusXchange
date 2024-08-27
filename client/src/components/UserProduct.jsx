import PropTypes from "prop-types";
import axios from "axios";
import config from "..config/";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProducts = ({
  products = [],
  onDeleteProduct,
  currentUser,
  onProductClick,
  hidePostedBy,
}) => {
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [likes, setLikes] = useState(
    products.reduce((acc, product) => {
      acc[product._id] = {
        likesCount: product.likes?.length || 0,
        isLiked: product.likes?.includes(currentUser?._id) || false,
        isProcessing: false,
      };
      return acc;
    }, {})
  );

  const handleDeleteProduct = async (productId, imageId) => {
    try {
      setDeletingProductId(productId);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${config.apiBaseUrl}/api/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageId },
        }
      );

      if (response.data.status === "ok") {
        onDeleteProduct(productId);
        toast.success("Product deleted successfully!");
      } else {
        console.error("Error deleting product:", response.data.message);
        toast.error("Failed to delete the product.");
        setDeletingProductId(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleLikeProduct = async (productId, e) => {
    e.stopPropagation();
    try {
      setLikes((prevLikes) => ({
        ...prevLikes,
        [productId]: {
          ...prevLikes[productId],
          isProcessing: true,
        },
      }));

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.apiBaseUrl}/api/products/${productId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "ok") {
        setLikes((prevLikes) => ({
          ...prevLikes,
          [productId]: {
            likesCount: response.data.likesCount,
            isLiked: response.data.isLiked,
            isProcessing: false,
          },
        }));
      } else {
        toast.error("Failed to like the product.");
        setLikes((prevLikes) => ({
          ...prevLikes,
          [productId]: {
            ...prevLikes[productId],
            isProcessing: false,
          },
        }));
      }
    } catch (error) {
      console.error("Error liking product:", error);
      toast.error("An error occurred while liking the product.");
      setLikes((prevLikes) => ({
        ...prevLikes,
        [productId]: {
          ...prevLikes[productId],
          isProcessing: false,
        },
      }));
    }
  };

  const handleProductClick = (product) => {
    const productWithLikes = {
      ...product,
      likesCount: likes[product._id]?.likesCount || 0,
    };
    onProductClick(productWithLikes);
  };

  if (!Array.isArray(products)) {
    return <p>Invalid products data</p>;
  }

  if (products.length === 0) {
    return <p>No products available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product._id} className="bg-gray-50 p-4 rounded shadow-md">
          <div className="relative">
            <img
              src={product.image || "default_img.png"}
              alt={product.name || "Product"}
              className="w-full h-36 object-cover mb-2 rounded-lg"
            />
            {/* Add the eye icon to trigger product details */}
            <button
              onClick={() => handleProductClick(product)}
              className="absolute top-22 right-2 text-xl transition-transform transform hover:scale-125 border border-gray-600 rounded-full p-0.5 hover:border-gray-800"
            >
              👁️
            </button>
          </div>
          <h2 className="text-xl font-bold">
            {product.name || "Unnamed Product"}
          </h2>
          <p>
            Used for: {product.purchaseDateMonth}/{product.purchaseDateYear}
          </p>
          <p className="text-lg font-bold">Price: ₹ {product.price}</p>
          {!hidePostedBy && (
            <p className="text-gray-600">
              Posted by: {product?.postedBy?.userId?.username || "Unknown User"}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            {currentUser?._id !== product?.postedBy?.userId && (
              <button
                onClick={(e) => handleLikeProduct(product._id, e)}
                disabled={!!likes[product._id]?.isProcessing}
                className={`container like-button z-10 ${
                  likes[product._id]?.isLiked ? "liked" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-heart"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <div className="action">
                  <span className="option-1">
                    {likes[product._id]?.isProcessing
                      ? likes[product._id]?.isLiked
                        ? "Unliking..."
                        : "Liking..."
                      : "Like"}
                  </span>
                  <span className="option-2">Liked</span>
                </div>
              </button>
            )}
            <span className="text-sm text-gray-700">
              {likes[product._id]?.likesCount ?? 0}{" "}
              {likes[product._id]?.likesCount === 1 ? "Like" : "Likes"}
            </span>
          </div>

          {currentUser?._id &&
            product?.postedBy?.userId === currentUser?._id && (
              <button
                onClick={() =>
                  handleDeleteProduct(product._id, product.imageId)
                }
                className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 ${
                  deletingProductId === product._id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={deletingProductId === product._id}
              >
                {deletingProductId === product._id ? "Deleting..." : "Delete"}
              </button>
            )}
        </div>
      ))}
    </div>
  );
};

UserProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      image: PropTypes.string,
      price: PropTypes.number.isRequired,
      purchaseDateMonth: PropTypes.string,
      purchaseDateYear: PropTypes.string,
      postedBy: PropTypes.shape({
        userId: PropTypes.oneOfType([
          PropTypes.shape({
            _id: PropTypes.string.isRequired,
            username: PropTypes.string,
          }),
          PropTypes.string,
        ]).isRequired,
      }).isRequired,
      likes: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onDeleteProduct: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  onProductClick: PropTypes.func.isRequired,
  hidePostedBy: PropTypes.bool,
};

export default UserProducts;
