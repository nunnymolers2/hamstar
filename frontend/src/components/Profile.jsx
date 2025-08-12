// These were lifted wholesale from Dashboard 
// in an attempt to get user info to display
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from 'react-router-dom';

// This is to save new password
import { useState } from "react";

import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";

function Profile() {
  const { user } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("This is my bio.");

  // What is this block doing?
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">Profile Dashboard</h1>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <p className="text-gray-700">
          <span className="font-medium">Name:</span> {user?.displayName}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Email:</span> {user?.email}
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <Input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* Save Password Button */}
        <Button variant="default">Save New Password</Button>
      </div>

      {/* Edit Bio */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">User Bio</h2>
        <Input
          label="Bio"
          multiline
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
        />
        {/* Save Bio Button */}
        <Button variant="default">Save New Bio</Button>
      </div>
    </div>
  );
}

export default Profile;
