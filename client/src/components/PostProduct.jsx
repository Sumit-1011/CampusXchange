// PostProduct.jsx
import { useState } from "react";
import axios from "axios";

const PostProduct = ({ setIsPostingProduct }) => {
  const [productDetails, setProductDetails] = useState({
    price: "",
    name: "",
    purchaseDateMonth: "",
    purchaseDateYear: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails({ ...productDetails, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("price", productDetails.price);
      formData.append("name", productDetails.name);
      formData.append("purchaseDateMonth", productDetails.purchaseDateMonth);
      formData.append("purchaseDateYear", productDetails.purchaseDateYear);

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

      if (response.data.status === "ok") {
        setIsPostingProduct(false);
      } else {
        console.error("Error posting product", response.data);
      }
    } catch (error) {
      console.error("Error posting product", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
      <h1 className="text-3xl font-bold mb-4">Post a Product</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 rounded mb-4"
          required
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          value={productDetails.price}
          onChange={handleInputChange}
          className="w-full p-2 rounded mb-4"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productDetails.name}
          onChange={handleInputChange}
          className="w-full p-2 rounded mb-4"
          required
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
          />
          <input
            type="text"
            name="purchaseDateYear"
            placeholder="Purchase Year"
            value={productDetails.purchaseDateYear}
            onChange={handleInputChange}
            className="w-1/2 p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => setIsPostingProduct(false)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default PostProduct;
