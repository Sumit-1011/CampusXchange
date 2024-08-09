import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostProduct from "./PostProduct";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatarImage: "",
  });
  const [products, setProducts] = useState([]);
  const [isPostingProduct, setIsPostingProduct] = useState(false);

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

    const fetchUserProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/user/products",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        //console.log("Fetched Products:", response.data.products);

        if (response.data.status === "ok") {
          setProducts([]);
          setProducts(response.data.products);
        } else {
          console.error("Error fetching user products", response.data);
        }
      } catch (error) {
        console.error("Error fetching user products", error);
      }
    };

    fetchUserData();
    fetchUserProducts();
  }, [navigate]);

  // This function will be passed to PostProduct to update the products state
  const handleProductPosted = (newProduct) => {
    if (!newProduct || !newProduct._id) {
      console.error("Posted product is undefined or invalid:", newProduct);
      return; // Skip adding the undefined or invalid product
    }
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setIsPostingProduct(false); // Close the PostProduct form after posting
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete("http://localhost:5000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      navigate("/register");
    } catch (error) {
      console.error("Error deleting account", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Overlay for PostProduct form when isPostingProduct is true */}
      {isPostingProduct && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
          <PostProduct
            setIsPostingProduct={setIsPostingProduct}
            onProductPosted={handleProductPosted}
          />
        </div>
      )}
      {/* Left side - User information and other options */}
      <div className="w-1/4 bg-white p-6 rounded shadow-md flex flex-col items-center h-screen">
        {user.avatarImage && (
          <img
            src={user.avatarImage}
            alt="User Avatar"
            className="w-24 h-24 rounded-full my-4 mt-8"
          />
        )}
        <p className="text-xl mb-2">Username: {user.username}</p>
        <p className="text-xl mb-4">Email: {user.email}</p>
        <button
          onClick={() => navigate("/")} // Add this onClick handler to navigate to the home page
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left"
        >
          Home
        </button>
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left">
          Your Products
        </button>
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left">
          Your Favorites
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left">
          Feedback
        </button>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left"
        >
          Delete Account
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full text-left"
        >
          Sign Out
        </button>
      </div>

      {/* Right side - Display user's products */}
      <div
        className={`w-3/4 flex-1 flex flex-col p-6 overflow-hidden ${
          isPostingProduct ? "blur-sm" : ""
        }`}
      >
        {/* Top 1/3rd with yellow background and space for search bar and Post Product button */}
        <div className="h-1/3 bg-yellow-400 flex items-center justify-between px-6">
          {/* Search Bar on the left side */}
          <input
            type="text"
            placeholder="Search Products"
            className="w-1/2 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Post a Product button on the right side */}
          <button
            onClick={() => setIsPostingProduct(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Post a Product
          </button>
        </div>

        {/* Bottom 2/3rd with product listing */}
        <div className="h-2/3 mt-4 overflow-y-auto">
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.length > 0 ? (
                products
                  .filter((product) => product && product._id)
                  .map((product) => {
                    //console.log("Product:", product);
                    return (
                      <div
                        key={product._id}
                        className="bg-white p-4 rounded shadow-md"
                      >
                        <img
                          src={product?.image || "chair.jpg"}
                          alt={product?.name || "Product"}
                          className="w-full h-32 object-cover mb-2"
                        />
                        <h2 className="text-xl font-bold">
                          {product?.name || "Unnamed Product"}
                        </h2>
                        <p>
                          Used for: {product?.purchaseDateMonth || "N/A"}/
                          {product?.purchaseDateYear || "N/A"}
                        </p>
                        <p className="text-lg font-bold">
                          Price: {product?.price || "N/A"}
                        </p>
                      </div>
                    );
                  })
              ) : (
                <p className="text-center text-lg">
                  You have not posted any products yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
