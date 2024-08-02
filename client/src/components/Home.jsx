import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatarImage: "",
  });
  const [products, setProducts] = useState([]);

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
          setProducts(response.data.products);
        } else {
          console.error("Error fetching products", response.data);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchUserData();
    fetchProducts();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-yellow-400 p-4">
        <div className="flex justify-between items-center mb-4">
          <input type="text" placeholder="Search..." className="p-2 rounded" />
          <div className="flex items-center">
            {user.avatarImage && (
              <img
                src={user.avatarImage}
                alt="User Profile"
                className="w-8 h-8 rounded-full cursor-pointer mr-4"
                onClick={() => navigate("/profile")}
              />
            )}
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <p>Posted by: {product.postedBy.userId.username}</p>{" "}
            {/* Display the username of the user */}
            <p className="text-lg font-bold">Price: {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
