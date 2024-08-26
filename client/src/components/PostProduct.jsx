import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types"; // Import PropTypes

const PostProduct = ({ setIsPostingProduct, onProductPosted }) => {
  const [productDetails, setProductDetails] = useState({
    price: "",
    name: "",
    purchaseDateMonth: "",
    purchaseDateYear: "",
    description: "", // Add description to state
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state to track form submission

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails({ ...productDetails, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable form on submit
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("price", productDetails.price);
      formData.append("name", productDetails.name);
      formData.append("purchaseDateMonth", productDetails.purchaseDateMonth);
      formData.append("purchaseDateYear", productDetails.purchaseDateYear);
      formData.append("description", productDetails.description);

      const response = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      //console.log("Product Posted Response:", response.data); // Log the response

      if (response.data.status === "ok") {
        const newProduct = response.data.product;
        if (typeof onProductPosted === "function") {
          onProductPosted(newProduct); // Call the function only if it is defined
          toast.success("Product posted for Admin Verification");
        } else {
          console.error("Posted product is undefined or invalid:", newProduct);
          toast.error("Error: Posted product is undefined.");
        }
        setIsPostingProduct(false);
      } else {
        toast.error("Error posting product: " + response.data.message);
      }
    } catch (error) {
      console.error("Error during product submission:", error); // Added for debugging
      toast.error("Error posting product: " + error.message);
    } finally {
      setIsSubmitting(false); // Re-enable form after submission attempt
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
      <h1 className="text-3xl font-bold mb-4">Post a Product</h1>
      <form onSubmit={handleSubmit} className="border-2 border-gray-200">
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 rounded mb-4"
          required
          autoComplete="off"
          disabled={isSubmitting} // Disable input during submission
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          value={productDetails.price}
          onChange={handleInputChange}
          className="w-full p-2 rounded mb-4"
          required
          autoComplete="off"
          disabled={isSubmitting} // Disable input during submission
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productDetails.name}
          onChange={handleInputChange}
          className="w-full p-2 rounded mb-4"
          required
          autoComplete="off"
          disabled={isSubmitting} // Disable input during submission
        />
        <div className="flex justify-between mb-4">
          <input
            type="text"
            name="purchaseDateMonth"
            placeholder="Purchase Month"
            value={productDetails.purchaseDateMonth}
            onChange={handleInputChange}
            className="w-1/2 p-2 rounded mr-2"
            required
            autoComplete="off"
            disabled={isSubmitting} // Disable input during submission
          />
          <input
            type="text"
            name="purchaseDateYear"
            placeholder="Purchase Year"
            value={productDetails.purchaseDateYear}
            onChange={handleInputChange}
            className="w-1/2 p-2 rounded"
            required
            autoComplete="off"
            disabled={isSubmitting} // Disable input during submission
          />
        </div>
        <div className="relative">
          <textarea
            name="description"
            placeholder="Product Description (max 75 characters)"
            value={productDetails.description}
            onChange={handleInputChange}
            className="w-full p-2 rounded mb-4 resize-none overflow-auto"
            maxLength="75" // Limit input to 75 characters
            rows="4"
            disabled={isSubmitting} // Disable input during submission
          />
          <p
            className={`text-gray-600 text-sm absolute bottom-6 right-1 ${
              75 - productDetails.description.length <= 15 ? "text-red-500" : ""
            }`}
          >
            {75 - productDetails.description.length}/75
          </p>
        </div>
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting} // Disable button during submission
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setIsPostingProduct(false)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isSubmitting} // Disable cancel button during submission
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

// Define PropTypes for PostProduct
PostProduct.propTypes = {
  setIsPostingProduct: PropTypes.func.isRequired,
  onProductPosted: PropTypes.func.isRequired,
};

export default PostProduct;
