import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostProduct from "./PostProduct";
import UserProduct from "./UserProduct";
import Shimmer from "./Shimmer";
import config from "../config";
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
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch current user data on mount
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

  // Fetch products based on the current user
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      setLoading(true);
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

  // Filter products based on search query
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = products.filter((product) =>
      product.name.toLowerCase().startsWith(lowercasedQuery)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Handle product posting
  const handleProductPosted = (newProduct) => {
    if (
      !newProduct ||
      !newProduct._id ||
      newProduct.postedBy.userId._id === user._id
    ) {
      return;
    }
    setProducts([...products, newProduct]);
    setIsPostingProduct(false);
  };

  // Handle product click to view details
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  // Handle starting a chat
  const handleStartChat = async (user1Id, user2Id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const response = await axios.post(
        `${config.apiBaseUrl}/api/chat/start-chat`,
        { user1Id, user2Id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "ok") {
        const chat = response.data.chat;
        console.log("Chat started or retrieved:", chat);
        console.log("Navigating to chat:", `/chat/${chat._id}`);
        navigate(`/chat/${chat._id}`, {
          state: { chatId: chat._id, contactId: user2Id },
        });
      } else {
        console.error(
          "Failed to start or retrieve chat:",
          response.data.message
        );
      }
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data.message);
      } else if (error.request) {
        console.error("No response from server:", error.request);
      } else {
        console.error("Error starting or retrieving chat:", error.message);
      }
    }
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
              <div onClick={() => navigate("/profile")}>
                <img
                  src={user.avatarImage}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full cursor-pointer mr-4"
                />
              </div>
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
            onProductClick={handleProductClick}
            onStartChat={handleStartChat}
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
