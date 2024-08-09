import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostProduct from "./PostProduct"; // Import the PostProduct component

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatarImage: "",
  });
  const [products, setProducts] = useState([]);
  const [isPostingProduct, setIsPostingProduct] = useState(false); // State to toggle product posting form

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

    const fetchProducts = async () => {
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
      }
    };

    fetchUserData();
    fetchProducts();
  }, [navigate, user._id]);

  const handleProductPosted = (newProduct) => {
    if (
      !newProduct ||
      !newProduct._id ||
      newProduct.postedBy.userId._id === user._id
    ) {
      return; // Skip adding the undefined or invalid product
    }
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setIsPostingProduct(false); // Close the PostProduct form after posting
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
            {user.avatarImage && (
              <img
                src={user.avatarImage}
                alt="User Profile"
                className="w-8 h-8 rounded-full cursor-pointer mr-4"
                onClick={() => navigate("/profile")}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className={`p-4 flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
          isPostingProduct ? "blur" : ""
        }`}
      >
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover mb-2"
            />
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p>
              Used for: {product.purchaseDateMonth}/{product.purchaseDateYear}
            </p>
            <p>Posted by: {product.postedBy.userId.username}</p>
            <p className="text-lg font-bold">Price: {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
