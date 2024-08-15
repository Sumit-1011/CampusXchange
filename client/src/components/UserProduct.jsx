import PropTypes from "prop-types";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProducts = ({
  products = [],
  onDeleteProduct,
  currentUser,
  hidePostedBy,
}) => {
  // State to track which product is being deleted
  const [deletingProductId, setDeletingProductId] = useState(null);

  const handleDeleteProduct = async (productId, imageId) => {
    try {
      setDeletingProductId(productId); // Set the product as being deleted
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
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
        setDeletingProductId(null); // Reset if deletion fails
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product.");
      setDeletingProductId(null); // Reset if there's an error
    }
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
        <div key={product._id} className="bg-white p-4 rounded shadow-md">
          <img
            src={product.image || "chair.jpg"}
            alt={product.name || "Product"}
            className="w-full h-32 object-cover mb-2"
          />
          <h2 className="text-xl font-bold">
            {product.name || "Unnamed Product"}
          </h2>
          <p>
            Used for: {product.purchaseDateMonth}/{product.purchaseDateYear}
          </p>
          <p className="text-lg font-bold">Price: {product.price}</p>
          {!hidePostedBy && (
            <p className="text-gray-600">
              Posted by: {product?.postedBy?.userId?.username || "Unknown User"}
            </p>
          )}

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
            _id: PropTypes.string.isRequired, // Assuming the user ID is a string inside the object
            username: PropTypes.string, // Adjust according to your structure
          }),
          PropTypes.string, // In case it's sometimes a string
        ]).isRequired,
      }).isRequired,
    })
  ),
  onDeleteProduct: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  hidePostedBy: PropTypes.bool,
};

export default UserProducts;
