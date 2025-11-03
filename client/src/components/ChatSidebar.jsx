import { useNavigate } from "react-router-dom";

const ChatSidebar = ({ contacts, onSelectContact, selectedContact }) => {
  const navigate = useNavigate();

  return (
    <div className="w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
      <button
        onClick={() => navigate("/")}
        className="my-4 w-full text-left flex items-center justify-center"
      >
        <img src="/cxclogo.png" alt="Home" className="h-16 w-72" />
      </button>
      <h2 className="p-4 font-bold border-b-2">Contacts</h2>
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`p-4 cursor-pointer ${selectedContact?._id === contact._id ? "bg-blue-100" : ""
            }`}
          onClick={() => onSelectContact(contact)}
        >
          <p className="font-medium">{contact.username}</p>
        </div>
      ))}
    </div>
  )
};

export default ChatSidebar;
