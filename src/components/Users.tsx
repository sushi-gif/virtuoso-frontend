import { useAuth } from "../auth/auth";
import "../style/app.css";
import { useApi } from "../utils/Hooks";
import { useQuery, useQueryClient } from "react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NavLink,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Loading } from "./Loading";
import { FaFloppyDisk } from "react-icons/fa6";
import React from "react";
import { FaSave, FaTrashAlt } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";


interface Users {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export function Users() {
  const { apiCall } = useApi();
  const auth = useAuth();

  const { data: users, isLoading, error } = useQuery(
    "users",
    () => apiCall<Users[]>("GET", "/auth/users"),
    { refetchInterval: 3000 }
  );

  return (
    <>
      <div className="main-header">
        <h1>Users</h1>
        <p className="description">
          This section provides a comprehensive overview of all users
          currently running within your environment. Designed for seamless
          monitoring and management, the dashboard displays real-time status
          updates, resource utilization, and key details such as max_cpu, memory
          allocation, and node assignments.
        </p>
      </div>

      <div className="content">
        <div className="content-main">
          {isLoading ? (
            <p className="loading-text">Loading users...</p>
          ) : error ? (
            <p className="error-text">Failed to load users.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>E-mail</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>#{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={user.is_admin ? "badge admin" : "badge user"}>
                        {user.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unavaiable'}</td>
                    <td>
                      <NavLink to={`/users/${user.id}`} className="user-edit">
                       <FaEdit size={12}/> Edit 
                      </NavLink>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
}

interface UserResponse{
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}
export function User() {
  const { apiCall } = useApi();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userData, isLoading, isError } = useQuery(
    [`user`, id],
    () => apiCall<UserResponse>("GET", `/auth/users/${id}`),
    { enabled: !!id }
  );

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    is_admin: false,
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username,
        email: userData.email,
        password: "",
        is_admin: userData.is_admin,
      });
    }
  }, [userData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        is_admin: formData.is_admin,
        ...(formData.password && { password: formData.password }),
      };

      await apiCall("PATCH", `/auth/users/${id}`, {}, payload);
      queryClient.invalidateQueries(["user", id]);
      navigate("/users");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Permanently delete this user? This cannot be undone.")) {
      try {
        await apiCall("DELETE", `/auth/users/${id}`);
        navigate("/users");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <div className="alert error">Error loading user</div>;

  return (
    <div className="container">
        <h1 className="title">Edit User</h1>
        <p className="subtitle">Modify user details and permissions</p>

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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              />
              <span className="checkmark"></span>
              Administrator Privileges
            </label>
            <p className="checkbox-help">
              Grants full system access and management capabilities
            </p>
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
          Delete User
        </button>
      </form>
    </div>
  );
}