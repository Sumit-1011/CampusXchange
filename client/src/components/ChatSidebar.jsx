const ChatSidebar = ({ contacts, onSelectContact, selectedContact }) => (
  <div className="w-1/4 bg-gray-100 border-r border-gray-300 overflow-y-auto">
    <h2 className="p-4 font-bold">Contacts</h2>
    {contacts.map((contact) => (
      <div
        key={contact._id}
        className={`p-4 cursor-pointer ${
          selectedContact?._id === contact._id ? "bg-blue-100" : ""
        }`}
        onClick={() => onSelectContact(contact)}
      >
        <p className="font-medium">{contact.username}</p>
      </div>
    ))}
  </div>
);

export default ChatSidebar;
