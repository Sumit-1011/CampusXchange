# Project: CampusXchange 🚀

## Description 📖

CampusXchange is a platform designed specifically for college students to buy and sell products within their college community. The platform fosters seamless and secure exchanges by allowing users to create accounts, post products for sale, view items listed by others, like products, and directly contact sellers to finalize deals. The application also includes features like real-time chatting and OTP verification for account security.

## Key Features ✨

- 🛡️ User registration and login with OTP verification.
- 📸 Product posting with up to three images per product.
- ❤️ Like and favorite products for better user engagement.
- 🌟 View all products a user has liked in the "Your Favorites" section.
- 💬 Real-time chat functionality for buyers and sellers.
- 👤 Avatar setup for users using the Multiavatar API.
- 💻 Responsive and intuitive user interface styled with Tailwind CSS.
- 😎 Admin can Approve or Deny Products to be posted on the platform.

## Technologies Used 🛠️

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Deployment**: AWS, Render
- **Image Hosting**: Cloudinary
- **Authentication**: OTP verification via Nodemailer
- **Unique Avatar Generation**: MultiAvatar API
- **Real-Time Communication**: WebSocket
- **Caching**: Redis

## How to Run Locally 🏃‍♂️

1. 🖥️ Clone the repository.
2. 🔧 Set up the `.env` file with required environment variables for Cloudinary, Redis, Nodemailer, etc.
3. 📦 Install dependencies using `npm install` for both client and server.
4. ▶️ Run the server: `npm start` in the backend directory.
5. ▶️ Run the client: `npm run dev` in the client directory.
6. 🌐 Access the application at `http://localhost:5173` (default Vite dev server port).

## Future Enhancements 🔮

- 📊 Add more advanced analytics for users.
- 💳 Implement additional payment methods for in-app purchases or services.
- 🤖 Introduce AI-based product categorization.

