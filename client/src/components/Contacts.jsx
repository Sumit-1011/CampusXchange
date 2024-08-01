import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const Contacts = ({ selectedContact, onSelectContact }) => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="contacts p-4 w-64 bg-gray-800 text-white h-screen">
      <input
        type="text"
        placeholder="Search by email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
      />
      {filteredContacts.map((contact, index) => (
        <div
          key={index}
          className={`contact p-2 mb-2 cursor-pointer flex items-center ${
            selectedContact && selectedContact._id === contact._id
              ? "bg-gray-600"
              : ""
          }`}
          onClick={() => onSelectContact(contact)}
        >
          <img
            src={contact.avatarImage}
            alt={contact.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          <span>{contact.username}</span>
        </div>
      ))}
    </div>
  );
};

Contacts.propTypes = {
  selectedContact: PropTypes.shape({
    _id: PropTypes.string,
    chatId: PropTypes.string,
  }),
  onSelectContact: PropTypes.func.isRequired,
};

export default Contacts;
