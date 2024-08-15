import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserProduct from "./UserProduct";
import PostProduct from "./PostProduct";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isPostingProduct, setIsPostingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("Profile"); // Track the selected section

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
      } finally {
        setLoading(false);
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

        if (response.data.status === "ok") {
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

  const handleProductPosted = (newProduct) => {
    if (!newProduct || !newProduct._id) {
      console.error("Posted product is undefined or invalid:", newProduct);
      return;
    }
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setIsPostingProduct(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error loading user data</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {isPostingProduct && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
          <PostProduct
            setIsPostingProduct={setIsPostingProduct}
            onProductPosted={handleProductPosted}
          />
        </div>
      )}

      <div className="w-1/4 bg-white p-6 rounded shadow-md flex flex-col items-center h-screen">
        <button
          onClick={() => navigate("/")}
          className="mb-4 w-full text-left flex items-center justify-center"
        >
          <img src="cxclogo.png" alt="Home" className="h-20 w-60" />
        </button>
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
          onClick={() => setSelectedSection("Profile")}
          className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left ${
            selectedSection === "Profile" ? "bg-yellow-700" : ""
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setSelectedSection("Your Products")}
          className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left ${
            selectedSection === "Your Products" ? "bg-gray-700" : ""
          }`}
        >
          Your Products
        </button>
        <button
          onClick={() => setSelectedSection("Your Favorites")}
          className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full text-left ${
            selectedSection === "Your Favorites" ? "bg-gray-700" : ""
          }`}
        >
          Your Favorites
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

      <div
        className={`w-3/4 flex-1 flex flex-col p-6 overflow-hidden ${
          isPostingProduct ? "blur-sm" : ""
        }`}
      >
        {/* Display different content based on the selected section */}
        {selectedSection === "Profile" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-2xl">Welcome to your profile!</p>
          </div>
        )}
        {selectedSection === "Your Products" && (
          <div className="flex flex-col h-full">
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
              <UserProduct
                products={products}
                currentUser={user}
                hidePostedBy={true}
                onDeleteProduct={(productId) => {
                  setProducts((prevProducts) =>
                    prevProducts.filter((product) => product._id !== productId)
                  );
                }}
              />
            </div>
          </div>
        )}
        {selectedSection === "Your Favorites" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-2xl">Here are your favorite products!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
