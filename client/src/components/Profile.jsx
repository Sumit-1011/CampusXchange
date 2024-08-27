import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "..config/";
import UserProduct from "./UserProduct";
import PostProduct from "./PostProduct";
import DeleteAccount from "./DeleteAccount";
import ProductDetails from "./ProductDetails";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isPostingProduct, setIsPostingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Profile"); // Track the selected section
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.apiBaseUrl}/api/user/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "ok") {
          //console.log(response.data.products); // Debugging step
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

  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.apiBaseUrl}/api/user/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "ok") {
          // console.log(
          //   "Fetched Liked Products from API:",
          //   response.data.products
          // );
          setLikedProducts(response.data.products);
          //console.log("Updated Liked Products State:", response.data.products);
        } else {
          console.error("Error fetching liked products:", response.data);
        }
      } catch (error) {
        console.error("Error fetching liked products:", error);
      }
    };

    if (selectedSection === "Your Favorites") {
      // console.log(
      //   "Selected section is 'Your Favorites'. Fetching liked products..."
      // );
      fetchLikedProducts();
    }
  }, [selectedSection]);

  const handleDeleteAccountClick = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    setShowConfirmationModal(false);
    // Proceed with account deletion
    await handleDeleteAccount();
  };

  const handleCancelDeleteAccount = () => {
    setShowConfirmationModal(false);
  };

  const handleProductPosted = (newProduct) => {
    if (!newProduct || !newProduct._id) {
      console.error("Posted product is undefined or invalid:", newProduct);
      return;
    }
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setIsPostingProduct(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
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

      const response = await axios.delete(`${config.apiBaseUrl}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        // Show success toast
        toast.success("Account deleted successfully");
        localStorage.removeItem("token");
        navigate("/register");
      } else {
        // Show error toast
        toast.error("Failed to delete account");
      }
    } catch (error) {
      // Show error toast for any other errors
      toast.error("Error deleting account");
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

      {showConfirmationModal && (
        <DeleteAccount
          message="Are you sure you want to delete your account?"
          onConfirm={handleConfirmDeleteAccount}
          onCancel={handleCancelDeleteAccount}
        />
      )}

      <div className="w-1/4 bg-white p-6 rounded shadow-md flex flex-col items-center h-screen">
        <button
          onClick={() => navigate("/")}
          className="mb-4 w-full text-left flex items-center justify-center"
        >
          <img src="cxclogo.png" alt="Home" className="h-16 w-72" />
        </button>
        {user.avatarImage && (
          <img
            src={user.avatarImage}
            alt="User Avatar"
            className="w-24 h-24 rounded-full my-4 mt-8"
          />
        )}
        <p className="text-xl mb-16">
          <span className="text-lg">Username: </span>
          <span className="font-semibold underline">{user.username}</span>
        </p>
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
          onClick={handleDeleteAccountClick}
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
          <div className="flex flex-col items-center justify-center h-full">
            {user.avatarImage && (
              <img
                src={user.avatarImage}
                alt="User Avatar"
                className="w-24 h-24 rounded-full mb-4"
              />
            )}
            <p className="text-3xl font-bold mb-2">{user.username}</p>
            <p className="text-xl text-gray-600 mb-2">{user.email}</p>
            <p className="text-sm text-gray-500 mb-6">
              {`Joined on ${new Date(user.dateJoined).toLocaleDateString()}`}
            </p>
            <div className="mt-auto">
              <p className="text-lg font-medium">
                {`You have posted ${products.length} product(s)`}
              </p>
            </div>
          </div>
        )}

        {selectedSection === "Your Products" && (
          <div className="flex flex-col h-full">
            {/* Top 1/3rd with yellow background and space for search bar and Post Product button */}
            <div className="h-1/3 bg-[#BBE9FF] flex items-center justify-between px-6">
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
                // onLikeProduct={handleLikeProduct}
                onDeleteProduct={(productId) => {
                  setProducts((prevProducts) =>
                    prevProducts.filter((product) => product._id !== productId)
                  );
                }}
                onProductClick={handleProductClick}
              />
            </div>
            {selectedProduct && (
              <ProductDetails
                product={selectedProduct}
                onClose={handleCloseProductDetails}
                hidePostedBy={true}
              />
            )}
          </div>
        )}
        {selectedSection === "Your Favorites" && (
          <div className="flex flex-col h-full">
            {/* Top 1/3rd with yellow background and space for search bar and Post Product button */}
            <div className="h-1/3 bg-[#BBE9FF] flex items-center justify-between px-6">
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
              {likedProducts && likedProducts.length > 0 ? (
                <UserProduct
                  products={likedProducts} // Pass the array of liked products
                  currentUser={user}
                  hidePostedBy={true}
                  onDeleteProduct={(productId) => {
                    setLikedProducts((prevProducts) =>
                      prevProducts.filter(
                        (product) => product._id !== productId
                      )
                    );
                  }}
                  // onLikeProduct={handleLikeProduct}
                />
              ) : (
                <p className="text-lg font-medium">
                  {`You haven't liked any product yet!`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
