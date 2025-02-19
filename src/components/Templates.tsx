import { useAuth } from "../auth/auth";
import "../style/settings.css";
import { useApi } from "../utils/Hooks";
import { useQuery, useQueryClient } from "react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useParams,
  Outlet,
  useOutletContext,
  useNavigate,
} from "react-router-dom";
import { VncScreen, VncScreenHandle } from "react-vnc";
import "../style/vm.css";
import { FaPlay, FaStop } from "react-icons/fa";
import { Loading } from "./Loading";
import { FaFloppyDisk } from "react-icons/fa6";
import React from "react";
import { FaSave, FaTrashAlt } from "react-icons/fa";

interface Template {
  name: string;
  namespace: string;
  description: string;
  max_cpu: number;
  max_ram: number;
  max_space: number;
  qemu_image: string;
  id: number;
  created_at: string;
  created_by: number;
}

interface TemplateFormData {
  name: string;
  max_cpu: number;
  max_ram: number;
  max_space: number;
  qemu_image: string;
  description: string;
}

interface TemplateResponse {
  id: number;
  name: string;
}

export function Templates() {
  const { apiCall } = useApi();
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    max_cpu: 1,
    max_ram: 1, // in GB
    max_space: 1, // in GB
    qemu_image: "",
    description: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const auth = useAuth();
  const user = auth?.userData;

  const templateData = useQuery(
    `templates`,
    () => apiCall<Template[]>("GET", `/templates`),
    { refetchInterval: 3000 }
  );

  const templates = templateData.data;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiCall<TemplateResponse>(
        "POST",
        "/templates",
        {},
        formData
      );
      console.log("Template created successfully:", response);
      closeModal(); // Close modal after successful creation
    } catch (error) {
      console.error("Error creating Template:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <div className="main-header">
        <h1>Templates</h1>
        <p style={{ paddingTop: 16 }}>
          This section provides a comprehensive overview of all Templates
          currently running within your environment. Designed for seamless
          monitoring and management, the dashboard displays real-time status
          updates, resource utilization, and key details such as max_cpu, memory
          allocation, and node assignments. Whether you're scaling workloads,
          troubleshooting, or simply keeping an eye on your infrastructure, this
          centralized view ensures you have complete control over your
          virtualized resources at a glance.
        </p>
      </div>

      <div className="content-header">
        <div className="content-header-intro">
          <h2>Templates created by Provider</h2>
          <p>
            Overview of all Templates currently running within your environment.
          </p>
        </div>
        <div className="content-header-actions">
          {
            user.is_admin ? 
            <a href="#" className="button" onClick={openModal}>
              <i className="ph-plus-bold"></i>
              <span>Create Template</span>
            </a>
            :
            ''
          }
          
        </div>
      </div>
      <div className="content">
        <div className="content-main">
          <div className="card-grid">
            {Array.isArray(templates) &&
              templates.map((template) => (
                <article className="card" key={template.id}>
                  <div className="card-header">
                    <div>
                      <span>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg"
                          alt="Kubernetes Logo"
                        />
                      </span>
                      <div style={{ paddingLeft: "5px", position: "relative" }}>
                        <h3 style={{ paddingBottom: "7px" }}>
                          {template.name}
                        </h3>
                        <div className="tag">
                          {new Date(template.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="card-body"
                    style={{ paddingTop: 8, paddingBottom: 16 }}
                  >
                    <p>{template.description}</p>

                    <p>
                      <b className="tag">Max Cpu Cores:</b> {template.max_cpu}{" "}
                      Cores
                    </p>
                    <p>
                      <b className="tag">Max. Memory:</b> {template.max_ram}Gb
                    </p>
                    <p>
                      <b className="tag">Max. Space:</b> {template.max_space}Gb
                    </p>
                  </div>
                  <div className="card-footer">
                    <NavLink to={`/templates/${template.id}/view`}>
                      View Template
                    </NavLink>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Template</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ display: "flex", width: "100%", gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label>Max. Cpu (Core)</label>
                  <input
                    type="number"
                    value={formData.max_cpu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_cpu: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Max. Ram (GB)</label>
                  <input
                    type="number"
                    value={formData.max_ram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_ram: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Max. Space (GB)</label>
                  <input
                    type="number"
                    value={formData.max_space}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_space: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label>Qemu Image</label>
                <input
                  type="text"
                  value={formData.qemu_image}
                  onChange={(e) =>
                    setFormData({ ...formData, qemu_image: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="button">
                  <FaFloppyDisk style={{ marginRight: 10 }} /> Create Template
                </button>
                <button
                  type="button"
                  className="button Stopped"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

interface TemplateFormData {
  name: string;
  max_cpu: number;
  max_ram: number;
  max_space: number;
  qemu_image: string;
  description: string;
}

export function Template() {
  const { apiCall } = useApi();
  const { id } = useParams<{ id: string }>();
  let navigate = useNavigate();

  // Fetch template data with refetchInterval for auto-refresh
  const {
    data: template,
    isLoading,
    isError,
  } = useQuery(
    `template.${id}`,
    () => apiCall<Template>("GET", `/templates/${id}`),
    {
      refetchInterval: 3000, // Refetch every 3 seconds
      enabled: !!id, // Ensure query is only run if id is available
    }
  );

  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    max_cpu: 1,
    max_ram: 1,
    max_space: 1,
    qemu_image: "",
    description: "",
  });

  const user = useAuth()?.userData;

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !template) {
    return <p>An error has occurred while fetching the template.</p>;
  }

  // Pre-populate form fields with fetched data
  if (template && !formData.name) {
    setFormData({
      name: template.name,
      description: template.description,
      max_cpu: template.max_cpu,
      max_ram: template.max_ram,
      max_space: template.max_space,
      qemu_image: template.qemu_image,
    });
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiCall<TemplateResponse>(
        "PUT",
        `/templates/${id}`,
        {},
        formData
      );
      console.log("Template updated successfully:", response);
      navigate("/templates");
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this template? This action cannot be undone."
    );

    if (isConfirmed) {
      try {
        await apiCall("DELETE", `/templates/${id}`);
        console.log("Template deleted successfully.");
        navigate("/templates");
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  return (
    <div>
      <h1>{user.is_admin ? 'Edit Template' : 'View Template'}</h1>
      <form onSubmit={handleFormSubmit} {...{inert: user.is_admin ? undefined : ''}}>
        <div>
          <label>Template Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div style={{ display: "flex", width: "100%", gap: 15 }}>
          <div style={{ flex: 1 }}>
            <label>Max. CPU</label>
            <input
              type="number"
              value={formData.max_cpu}
              onChange={(e) =>
                setFormData({ ...formData, max_cpu: parseInt(e.target.value) })
              }
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Max. Ram (GB)</label>
            <input
              type="number"
              value={formData.max_ram}
              onChange={(e) =>
                setFormData({ ...formData, max_ram: parseInt(e.target.value) })
              }
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Max. Space (GB)</label>
            <input
              type="number"
              value={formData.max_space}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_space: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
        </div>
        <div>
          <label>O.S. Image</label>
          <input
            type="text"
            value={formData.qemu_image}
            onChange={(e) =>
              setFormData({ ...formData, qemu_image: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>
        {
          user.is_admin ? 
            <>
                    <button className="button" type="submit">
          <FaFloppyDisk style={{ marginRight: 10 }} />
          Update Template
        </button>
        <button
          className="button Stopped"
          onClick={handleDelete}
          style={{ marginLeft: 10 }}
        >
          <FaTrashAlt style={{ marginRight: 10 }} />
          Delete Template
        </button>
        </>
          :
          ''
        }

      </form>
    </div>
  );
}
