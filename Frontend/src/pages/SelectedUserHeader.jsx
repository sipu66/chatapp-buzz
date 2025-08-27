import React from "react";

const SelectedUserHeader = ({ selectedUser, onlineUsers }) => {
  if (!selectedUser) return null;

  return (
    <div className="flex items-center p-3 border-b bg-gradient-to-r from-blue-100 to-blue-200 rounded-t-lg shadow-md">
      {selectedUser.avatar?.url ? (
        <img
          src={selectedUser.avatar.url}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-blue-500"
        />
      ) : (
        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 border-2 border-blue-500">
          {selectedUser.fullname[0]}
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-bold text-xl text-blue-800">{selectedUser.fullname}</span>
        {onlineUsers.includes(selectedUser._id) && (
          <span className="text-green-600 text-sm font-medium">Online</span>
        )}
      </div>
    </div>
  );
};

export default SelectedUserHeader;
