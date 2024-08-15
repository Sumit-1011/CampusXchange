import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostProduct from "./PostProduct";
import UserProduct from "./UserProduct";
import Shimmer from "./Shimmer";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isPostingProduct, setIsPostingProduct] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/user", {
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
        const response = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "ok") {
          const filteredProducts = response.data.products.filter(
            (product) => product.postedBy.userId._id !== user._id
          );
          setProducts(filteredProducts);
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
  }, [user]);

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

      <div className={`bg-yellow-400 p-4 ${isPostingProduct ? "blur" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <input type="text" placeholder="Search..." className="p-2 rounded" />
          <div className="flex items-center">
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
        ) : user && products.length > 0 ? (
          <UserProduct
            products={products}
            currentUser={user}
            onDeleteProduct={(productId) =>
              setProducts((prevProducts) =>
                prevProducts.filter((product) => product._id !== productId)
              )
            }
          />
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
