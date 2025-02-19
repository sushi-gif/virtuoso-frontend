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
} from "react-router-dom";
import { VncScreen, VncScreenHandle } from "react-vnc";
import "../style/vm.css";
import { FaPlay, FaPlus, FaStop, FaTrashAlt } from "react-icons/fa";
import { Loading } from "./Loading";
import { FaFloppyDisk } from "react-icons/fa6";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TbReload } from "react-icons/tb";

interface VolumeInfo {
  id: string;
  name: string;
  owner: string;
  authorized: string[];
  creation: string;
  size: string;
  type: "hdd" | "cd" | "fs";
  storage: string;
  status: "pending" | "bound";
}

interface SocketProxyInfo {
  proxyUrl: string;
  expiresIn: number;
}

interface Disk {
  name: string;
  bus?: string;
}

interface Network {
  name: string;
}

interface Volume {
  name: string;
  containerDiskImage?: string;
}

interface KubeStatus {
  uid: string;
  creationTimestamp: string;
  cores: number;
  memory: string;
  status: string;
  networks: Network[];
  disks: Disk[];
  volumes: Volume[];
  pvcs: {
    name: string;
    size: string;
    status: string;
  }[];
}

interface VirtualMachine {
  id: number;
  name: string;
  namespace: string;
  user_id: number;
  template_id: number;
  created_at: string;
  kube_status: KubeStatus;
}

interface VirtualMachineResponse {
  id: number;
  name: string;
  // Add other fields that the response might include
}

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

interface VMFormData {
  name: string;
  template_id: number;
  cpu: number;
  ram: number;
  space: number;
  password: string;
}

interface VmCosts {
  recorded_at: string | null;
  cpu_cores: number;
  ram_gb: number;
  cost_per_hour: number;
}

interface VmUpdate {
  cpu: number;
  ram: number;
}

interface VMI{
  name: string;
  macAddress: string;
  ipv4Address: string;
}

export function VMs() {
  const { apiCall } = useApi();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState<VMFormData>({
    name: "",
    template_id: 0,
    cpu: 1,
    ram: 1, // in GB
    space: 1, // in GB
    password: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const { data: vms } = useQuery<VirtualMachine[]>(
    "vms",
    () => apiCall("GET", "/vms") as Promise<VirtualMachine[]>
  );
  const { data: templatesData, isLoading: templatesLoading } = useQuery<Template[]>(
    "templates",
    () => apiCall("GET", "/templates") as Promise<Template[]>
  );

  useEffect(() => {
    if (templatesData) {
      setTemplates(templatesData); // Set templates once fetched
    }
  }, [templatesData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when the request starts
    try {
      const response = await apiCall<VirtualMachineResponse>(
        "POST",
        "/vms",
        {},
        formData
      );
      console.log("VM created successfully:", response);
      closeModal(); // Close modal after successful creation
    } catch (error) {
      console.error("Error creating VM:", error);
    } finally {
      setIsLoading(false); // Set loading to false when the request completes
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="main-header">
        <h1>Virtual Machines</h1>
        <p style={{ paddingTop: 16 }}>
          This section provides a comprehensive overview of all virtual machines
          currently running within your environment. Designed for seamless
          monitoring and management, the dashboard displays real-time status
          updates, resource utilization, and key details such as CPU, memory
          allocation, and node assignments. Whether you're scaling workloads,
          troubleshooting, or simply keeping an eye on your infrastructure, this
          centralized view ensures you have complete control over your
          virtualized resources at a glance.
        </p>
      </div>

      <div className="content-header">
        <div className="content-header-intro">
          <h2>Machines running on default namespace</h2>
          <p>
            Overview of all virtual machines currently running within your
            environment.
          </p>
        </div>
        <div className="content-header-actions">
          <a href="#" className="button" onClick={openModal}>
            <i className="ph-plus-bold"></i>
            <span>Create Virtual Machine</span>
          </a>
        </div>
      </div>
      <div className="content">
        <div className="content-main">
          <div className="card-grid">
            {Array.isArray(vms) &&
              vms.map((vm) => (
                <article className="card" key={vm.id}>
                  <span
                    className={`status-indicator ${vm.kube_status.status}`}
                  ></span>
                  <div className="card-header">
                    <div>
                      <span>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg"
                          alt="Kubernetes Logo"
                        />
                      </span>
                      <div style={{ paddingLeft: "5px", position: "relative" }}>
                        <h3 style={{ paddingBottom: "7px" }}>{vm.name}</h3>
                        <div className="tag">
                          {new Date(
                            vm.kube_status.creationTimestamp
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="card-body"
                    style={{ paddingTop: 8, paddingBottom: 16 }}
                  >
                    <p>
                      <b className="tag">Cpu Cores:</b> {vm.kube_status.cores}{" "}
                      Cores
                    </p>
                    <p>
                      <b className="tag">Memory:</b> {vm.kube_status.memory}
                    </p>
                    <p>
                      <b className="tag">Disks:</b>{" "}
                      {vm.kube_status.pvcs
                        ?.map((d) => `${d.name} (${d.size || "Unknown"})`)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="card-footer">
                    <NavLink to={`/vm/${vm.id}/vnc`}>Launch Machine</NavLink>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Virtual Machine</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>VM Name</label>
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
                  <label>CPU</label>
                  <input
                    type="number"
                    value={formData.cpu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpu: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>RAM (GB)</label>
                  <input
                    type="number"
                    value={formData.ram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ram: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Disk Space (GB)</label>
                  <input
                    type="number"
                    value={formData.space}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        space: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label>Template</label>
                <select
                  value={formData.template_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      template_id: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value="">Select Template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="button" disabled={isLoading}>
                  {isLoading ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <FaFloppyDisk style={{ marginRight: 10 }} /> Create Virtual Machine
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="button Stopped"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
            {isLoading && (
              <div className="loader-overlay">
                <div className="loader"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export function VM() {
  const { apiCall } = useApi();
  const { id: vmId } = useParams();

  const vm = useQuery(
    `vm.${vmId}`,
    () => apiCall<VirtualMachine>("GET", `/vms/${vmId}`),
    { refetchInterval: 3000 }
  );

  const costs = useQuery(
    `vm.${vmId}.costs`,
    () => apiCall<VirtualMachine>("GET", `/vms/${vmId}/costs`),
    { refetchInterval: 3000 }
  );

  if (vm.isLoading) return <Loading />;
  if (!vm.data) return <p>An error has occurred</p>;

  const vmData = vm.data;
  const vmCosts = costs.data;

  return (
    <>
      <div className="main-header">
        <h1>Virtual Machine {vmData.name}</h1>
      </div>
      <div className="horizontal-tabs">
        <NavLink
          to={`/vm/${vmId}/vnc`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Machine
        </NavLink>
        <NavLink
          to={`/vm/${vmId}/settings`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Configuration
        </NavLink>
        <NavLink
          to={`/vm/${vmId}/volumes`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Volumes
        </NavLink>
        <NavLink
          to={`/vm/${vmId}/snapshots`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Snapshots
        </NavLink>
        <NavLink
          to={`/vm/${vmId}/costs`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Costs
        </NavLink>
      </div>
      <Outlet context={[vmData, vmCosts]} />
    </>
  );
}

export function VMVnc() {
  const [vmData, vmCosts] = useOutletContext<[VirtualMachine, VmCosts]>();
  const consoleRef = useRef<VncScreenHandle>(null);
  const vmConsoleRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const { apiCall } = useApi();
  const { id: vmId } = useParams();

  const vmi = useQuery(
    `vm.${vmId}.vmi`,
    () => apiCall<VMI>("GET", `/vms/${vmId}/vmi`),
    { refetchInterval: 3000 }
  );

  const vmiData = vmi.data;

  let apiEndpoint =
    process.env["REACT_APP_API_ENDPOINT"] || "http://localhost:8000/";
  if (apiEndpoint.endsWith("/")) {
    apiEndpoint = apiEndpoint.substring(0, apiEndpoint.length - 1);
  }

  const hasConsole = ["Running", "Stopping"].includes(
    vmData.kube_status.status
  );

  // Construct WebSocket URL with token in protocol header
  const consoleUrl = hasConsole
    ? `${apiEndpoint.replace('http', 'ws')}/vms/${vmData.id}/vnc-proxy?token=${auth?.token}`
    : null;


  return (
    <>
      <div className="content-header">
        <div className="content-header-intro">
          <h2>Machine Vnc Panel</h2>
          <p>
            Interact with the virtual machine by scrolling down. To edit it,
            click on the Configuration tab.
          </p>
        </div>
      </div>
      <div className="vm-console-view">
        <div className="vm-console" ref={vmConsoleRef}>
          {vmData.kube_status.status === "Stopped" && (
            <div className="warn warn-abs">
              This Machine appears to be either offline or reloading.
            </div>
          )}
          {consoleUrl && (
            <VncScreen
              url={consoleUrl}
              ref={consoleRef}
              style={{ width: "100%", height: "100%" }}
              loadingUI={<div>Loading VNC Console...</div>}
              onConnect={() => console.log("VNC Connected!")}
              onDisconnect={() => console.log("VNC Disconnected!")}
            />
          )}
          <span className="tag cursor name">[{vmiData?.name}/{vmiData?.macAddress}] - {vmiData?.ipv4Address}</span>
          <span
            className={`status-indicator ${vmData.kube_status.status}`}
          ></span>
        </div>
      </div>
    </>
  );
}
const convertMemoryToMB = (memory: string): number => {
  if (memory.endsWith("Gi")) {
    return parseFloat(memory);
  }
  return 0; // Default fallback
};

export function VMSettings() {
  const { apiCall } = useApi();
  const { id } = useParams<{ id: string }>();
  const [vmData, vmCosts] = useOutletContext<[VirtualMachine, VmCosts]>();
  const [formData, setFormData] = useState<VmUpdate>({
    cpu: vmData?.kube_status.cores || 1,
    ram: vmData ? convertMemoryToMB(vmData.kube_status.memory) : 1,
  });

  useEffect(() => {
    if (vmData) {
      setFormData({
        cpu: vmData.kube_status.cores,
        ram: convertMemoryToMB(vmData.kube_status.memory),
      });
    }
  }, [vmData]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: Number(value), // Ensure the value is a number
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall<VmUpdate>("PATCH", `/vms/${id}`, {}, formData);
      alert("VM updated successfully!");
    } catch (error) {
      console.error("Failed to update VM:", error);
      alert("Failed to update VM.");
    }
  };

  // Handle case when vmData is undefined
  if (!vmData) {
    return <p>Virtual Machine data is not available.</p>;
  }

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this machine? This action likely cannot be undone."
    );

    if (isConfirmed) {
      try {
        await apiCall("DELETE", `/vms/${id}`);
        console.log("Machine deleted successfully.");
      } catch (error) {
        console.error("Error deleting machine:", error);
      }
    }
  };

  return (
    <>
      <div className="content-header">
        <div className="content-header-intro">
          <h2>Settings</h2>
          <p>
            In order for new settings to take effect, you must restart or power
            off your machine.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="content wide-l grid-2">
          <div className="content-main">
            <div className="card-grid">
              {/* Non-editable fields */}
              <div className="search wide-input">
                <label>ID</label>
                <input type="text" value={vmData.kube_status.uid} disabled />
              </div>
              <div className="search wide-input">
                <label>Name</label>
                <input type="text" value={vmData.name} disabled />
              </div>
              <div className="search wide-input">
                <label>Status</label>
                <input type="text" value={vmData.kube_status.status} disabled />
              </div>
              <div className="search wide-input">
                <label>Namespace</label>
                <input type="text" value={vmData.namespace} disabled />
              </div>

              {/* Editable fields */}
              <div className="search wide-input">
                <label>CPU Cores</label>
                <input
                  type="number"
                  name="cpu"
                  value={formData.cpu}
                  onChange={handleChange}
                  min="1" // Minimum CPU cores
                  required
                />
              </div>
              <div className="search wide-input">
                <label>Memory (GB)</label>
                <input
                  type="number"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  min="1" // Minimum memory
                  required
                />
              </div>

              {/* Non-editable fields */}
              <div className="search wide-input">
                <label>Network</label>
                <input
                  type="text"
                  value={vmData.kube_status.networks
                    .map((n) => n.name)
                    .join(", ")}
                  disabled
                />
              </div>
            </div>
            <button type="submit" className="button">
              <FaFloppyDisk style={{ marginRight: 10 }} />
              Update Machine
            </button>
              <a
                className="button Stopped"
                onClick={handleDelete}
                style={{ marginLeft: 10 }}
              >
                <FaTrashAlt style={{ marginRight: 10 }} />
                Delete Machine
              </a>
          </div>
        </div>
      </form>
      
    </>
  );
}


export function VMVolumes() {
  const [vmData, vmCosts] = useOutletContext<[VirtualMachine, VmCosts]>();

  // Handle case when vmData is undefined
  if (!vmData) {
    return <p>Virtual Machine data is not available.</p>;
  }

  return (
    <>
      <div className="content-header">
        <div className="content-header-intro">
          <h2>Volumes</h2>
          <p>
            Lorem Ipsum Dolor.
          </p>
        </div>
      </div>
      <div className="content wide-l grid-2">
        <div className="content-main">
          <div className="card-grid">
            {vmData.kube_status.volumes &&
              vmData.kube_status.volumes.map((volume) => (
                <article className="card" key={volume.name}>
                  <div className="card-header">
                    <div className="vm-volume">
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <p
                          style={{
                            gap: 6,
                            display: "flex",
                            paddingTop: 5,
                            marginBottom: 0,
                          }}
                        >
                          <span>{volume.containerDiskImage || "No Image"}</span>
                        </p>
                        <h3>{volume.name}</h3>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            {vmData.kube_status.pvcs &&
              vmData.kube_status.pvcs.map((volume) => (
                <article className="card" key={volume.name}>
                  <div className="card-header">
                    <div className="vm-volume">
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <p
                          style={{
                            gap: 6,
                            display: "flex",
                            paddingTop: 5,
                            marginBottom: 0,
                          }}
                        >
                          <span>{volume.size || "Disk size unavailable"}</span>
                          <span>
                            {volume.status || "Disk status unavailable"}
                          </span>
                        </p>
                        <h3>{volume.name}</h3>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface Snapshot{
  id: number,
  name: string,
  namespace: string,
  creationTimestamp: string
}

export function VMSnapshots() {
  const { apiCall } = useApi();
  const { id: vmId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();


  // Fetch snapshots for the given VM using the GET endpoint
  const { data: snapshots, isLoading } = useQuery<Snapshot[]>(
    [`vm.${vmId}.snapshots`],
    async () => {
      const result = await apiCall<Snapshot[]>("GET", `/vms/${vmId}/snapshots/`);
      return result ?? []; // Ensure it always returns an array
    }
  );
  

  // Create a new snapshot using the POST endpoint
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("POST", `/vms/${vmId}/snapshots/`, {});
      // Invalidate and refetch the snapshots list
      queryClient.invalidateQueries(`vm.${vmId}.snapshots`);
    } catch (error) {
      console.error("Error creating snapshot:", error);
      alert("Failed to create snapshot.");
    }
  };

  // Delete a snapshot using the DELETE endpoint
  const handleDeleteSnapshot = async (snapId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this snapshot?");
    if (!confirmDelete) return;

    try {
      await apiCall("DELETE", `/vms/${vmId}/snapshots/${snapId}`);
      // Invalidate and refetch the snapshots list
      queryClient.invalidateQueries(`vm.${vmId}.snapshots`);
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      alert("Failed to delete snapshot.");
    }
  };

  return (
    <>
 
      <div className="content-header">
      <div className="content-header-intro">
          <h2>Snapshots</h2>
          <p>Manage snapshots for your virtual machine.</p>
        </div>
        <div className="content-header-actions">
          <button className="button" onClick={handleCreateSnapshot} >
            <TbReload style={{ marginRight: 8 }} />
            Create Snapshot
          </button>
        </div>
      </div>
      <div className="content wide-l grid-2">
        <div className="content-main">
          <div className="card-grid"></div>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="card-grid">
            {snapshots ? (
              snapshots.map((snapshot) => (
                <article className="card" key={snapshot.id} style={{padding: "6px 0px"}}>
                  <div className="card-header">
                    <span className="tag">
                      {new Date(snapshot.creationTimestamp).toLocaleString()}
                    </span>
                    <h3 style={{marginRight: "auto", marginTop: 4, marginLeft: 6}}>{snapshot.name}</h3>
                  </div>
                  <div className="card-footer">
                    <button
                      className="button Stopped"
                      onClick={() => handleDeleteSnapshot(snapshot.id)}
                    >
                      <FaTrashAlt style={{marginRight: 8}}/> Delete
                    </button>
                  </div>
                </article>
                
              ))
            ) : (
              <p>No snapshots available for this VM.</p>
            )}
          </div>
        )}
        </div>
        </div>
      
      
    </>
  );
}

export function VmCosts() {
  const [vmData, vmCosts] = useOutletContext<[VirtualMachine, VmCosts[]]>();

  // Handle case when vmCosts is undefined
  if (!vmCosts) {
    return <p>Virtual Machine data is not available.</p>;
  }

  console.log("here");
  console.log(vmCosts);

  // Transform the data for the chart
  const chartData = vmCosts.map((cost) => {
    const recordedAt = cost.recorded_at
      ? new Date(cost.recorded_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"; // Handle null values

    return {
      recorded_at: recordedAt,
      cost: cost.cost_per_hour,
      cpu_cores: cost.cpu_cores,
      ram_gb: cost.ram_gb,
    };
  });

  return (
    <>
      <div className="content-header">
        <div className="content-header-intro">
          <h2>Costs Over Time</h2>
          <p>Visualizing VM costs over time with CPU and RAM insights.</p>
        </div>
      </div>
      <div className="content-main">
        <div
          style={{
            backgroundColor: "#fff",
            paddingTop: "4rem",
            paddingBottom: "2rem",
            borderRadius: "3px",
          }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              {/* Grid and axes */}
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="recorded_at"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#ccc" }}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />

              {/* Legend */}
              <Legend
                wrapperStyle={{
                  paddingTop: "10px",
                  fontSize: "12px",
                }}
              />

              {/* Lines */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cost"
                stroke="#3182ce" // Blue for cost
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Cost per Hour"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cpu_cores"
                stroke="#38a169" // Green for CPU cores
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="CPU Cores"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ram_gb"
                stroke="#dd6b20" // Orange for RAM
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="RAM (GB)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
