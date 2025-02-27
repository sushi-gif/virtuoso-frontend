import { NavLink, Outlet } from "react-router-dom";
import "../style/app.css";
import { useApi } from "../utils/Hooks";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Loading } from "./Loading";
import "../style/app.css";
import "../style/profile.css";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth";
import { FaFloppyDisk } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";

interface UserFormData {
  username: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export function Profile() {
  const { apiCall } = useApi();
  const user = useAuth()?.userData;
  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery(
    `profile`,
    () => apiCall<UserResponse>("GET", `/auth/users/me`),
    {
      refetchInterval: 3000,
      enabled: !!user,
    }
  );

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username,
        email: userData.email,
        password: "",
      });
    }
  }, [userData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
      };

      await apiCall("PATCH", `/auth/users/me`, {}, payload);
      queryClient.invalidateQueries("profile");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Permanently delete your profile? This cannot be undone.")) {
      try {
        await apiCall("DELETE", `/auth/users/me`);
        // Add any additional logout/redirect logic here
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <div className="alert error">Error loading profile</div>;

  return (
    <div className="container">
      <h1 className="title">Your Profile</h1>
      <p className="subtitle">Manage your account details and security settings</p>

      <form onSubmit={handleFormSubmit} className="user-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>

        <button type="submit" className="button save-button">
          <FaFloppyDisk className="icon" style={{ marginRight: 10 }} />
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="button delete-button Stopped"
          style={{ marginLeft: 10 }}
        >
          <FaTrashAlt className="icon" style={{ marginRight: 10 }} />
          Delete Profile
        </button>
      </form>
    </div>
  );
}