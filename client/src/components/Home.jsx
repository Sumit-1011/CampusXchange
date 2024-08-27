import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostProduct from "./PostProduct";
import UserProduct from "./UserProduct";
import Shimmer from "./Shimmer";
import config from "./config";
import ProductDetails from "./ProductDetails";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isPostingProduct, setIsPostingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // New state for selected product

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${config.apiBaseUrl}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "ok") {
          setUser(response.data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.apiBaseUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "ok") {
          const filteredProducts = response.data.products.filter(
            (product) => product.postedBy.userId._id !== user._id
          );

          const sortedProducts = filteredProducts.sort((a, b) => {
            if (sortBy === "date") {
              return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === "likes") {
              return b.likesCount - a.likesCount;
            }
            return 0;
          });

          setProducts(sortedProducts);
          setFilteredProducts(sortedProducts);
        } else {
          console.error("Error fetching products", response.data);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, sortBy]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = products.filter((product) =>
      product.name.toLowerCase().startsWith(lowercasedQuery)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleProductPosted = (newProduct) => {
    if (
      !newProduct ||
      !newProduct._id ||
      newProduct.postedBy.userId._id === user._id
    ) {
      return;
    }
    setProducts(products);
    setIsPostingProduct(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isPostingProduct && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
          <PostProduct
            setIsPostingProduct={setIsPostingProduct}
            onProductPosted={handleProductPosted}
          />
        </div>
      )}

      <div className={`bg-[#BBE9FF] p-4 ${isPostingProduct ? "blur" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 rounded border"
            >
              <option value="date">Sort by Date</option>
              <option value="likes">Sort by Likes</option>
            </select>
            <button
              onClick={() => setIsPostingProduct(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
            >
              Post a Product
            </button>
            {user?.avatarImage && (
              <img
                src={user.avatarImage}
                alt="User Profile"
                className="w-10 h-10 rounded-full cursor-pointer mr-4"
                onClick={() => navigate("/profile")}
              />
            )}
          </div>
        </div>
      </div>

      <div className={`p-4 flex-1 ${isPostingProduct ? "blur" : ""}`}>
        {loading ? (
          Array(8)
            .fill(0)
            .map((_, index) => <Shimmer key={index} />)
        ) : user && filteredProducts.length > 0 ? (
          <UserProduct
            products={filteredProducts}
            currentUser={user}
            onDeleteProduct={(productId) =>
              setFilteredProducts((prevProducts) =>
                prevProducts.filter((product) => product._id !== productId)
              )
            }
            onProductClick={handleProductClick} // Pass the click handler to UserProduct
          />
        ) : (
          <p>No products available</p>
        )}
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={handleCloseProductDetails}
        />
      )}
    </div>
  );
};

export default Home;
