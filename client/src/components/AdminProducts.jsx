import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import ProductDetails from "./ProductDetails"; // Import the ProductDetails component

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [admin, setAdmin] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // New state for selected product

  useEffect(() => {
    const fetchUnapprovedProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.apiBaseUrl}/api/admin/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "ok") {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
        } else {
          console.error("Error fetching products", response.data.message);
          setAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching products", error);
        setAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUnapprovedProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.apiBaseUrl}/api/admin/products/${productId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "ok") {
        setProducts(products.filter((product) => product._id !== productId));
        setFilteredProducts(
          filteredProducts.filter((product) => product._id !== productId)
        );
      } else {
        console.error("Error approving product", response.data.message);
      }
    } catch (error) {
      console.error("Error approving product", error);
    }
  };

  const handleDeny = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${config.apiBaseUrl}/api/admin/products/${productId}/deny`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "ok") {
        setProducts(products.filter((product) => product._id !== productId));
        setFilteredProducts(
          filteredProducts.filter((product) => product._id !== productId)
        );
      } else {
        console.error("Error deleting product", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().startsWith(searchTerm)
        )
      );
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product); // Set the selected product for viewing
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null); // Close the ProductDetails view
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-screen overflow-auto">
      <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-lg">
        <h1 className="text-3xl font-bold text-center p-4">
          {admin ? "Unapproved Products" : "You are not an Admin!"}
        </h1>
        {admin && (
          <div className="mb-3 p-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search products..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="pt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white p-6 shadow-lg rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-auto h-auto object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-500 mb-4">Price: ₹{product.price}</p>
            <p className="text-gray-500 mb-4">
              Posted by: {product?.postedBy?.userId?.username || "Unknown User"}
            </p>
            <p className="text-gray-500 mb-4">
              Email: {product?.postedBy?.userId?.email || "Unknown Email"}
            </p>
            <p className="text-gray-500 mb-4">
              Description: {product.description || "No description available"}
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleApprove(product._id)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleDeny(product._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Deny
              </button>
              <button
                onClick={() => handleView(product)}
                className="px-4 py-2 text-xl transition-transform transform hover:scale-110 border border-gray-600 rounded-full p-0.5 hover:border-gray-800"
              >
                👁️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render ProductDetails if a product is selected */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default AdminProducts;
