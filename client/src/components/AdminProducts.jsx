import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } else {
        console.error("Error deleting product", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Unapproved Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 shadow rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-500">Price: ₹{product.price}</p>
            <p className="text-gray-500">
              Posted by: {product.postedBy.username}
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleApprove(product._id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleDeny(product._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
