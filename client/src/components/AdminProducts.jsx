import { useEffect, useState } from "react";
import axios from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUnapprovedProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/admin/products",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "ok") {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
        } else {
          console.error("Error fetching products", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching products", error);
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
        `http://localhost:5000/api/admin/products/${productId}/approve`,
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
        `http://localhost:5000/api/admin/products/${productId}/deny`,
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

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-screen overflow-auto">
      <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-lg">
        <h1 className="text-3xl font-bold text-center p-4">
          Unapproved Products
        </h1>
        <div className="mb-3 p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
