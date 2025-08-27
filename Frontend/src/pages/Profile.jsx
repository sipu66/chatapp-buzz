import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const Profile = () => {
  const dispatch = useDispatch();
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullname || "",
    avatar: null,
  });

  if (!authUser) return <p>Loading...</p>;

  const handleFileChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("fullname", formData.fullName);
    if (formData.avatar) payload.append("avatar", formData.avatar);

    dispatch(updateProfile(payload))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully");
        setEditMode(false);
      })
      .catch(() => {
        toast.error("Failed to update profile");
      });
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-8 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">My Profile</h2>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex flex-col items-center">
        {authUser.avatar?.url ? (
          <img
            src={authUser.avatar.url}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-4 object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-xl font-bold">
            {authUser.fullname[0]}
          </div>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar</label>
            <input type="file" onChange={handleFileChange} className="mt-1" />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            {isUpdatingProfile ? "Updating..." : "Update Profile"}
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <p>
            <strong>Full Name:</strong> {authUser.fullname}
          </p>
          <p className="mt-2">
            <strong>Email:</strong> {authUser.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
