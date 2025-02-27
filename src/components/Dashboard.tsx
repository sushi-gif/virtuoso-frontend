import { useApi } from "../utils/Hooks";
import { useQuery } from "react-query";
import { Loading } from "./Loading";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface VMMetrics {
  cpu_usage: string;
  memory_usage: string;
  vm_id: number;
  vm_name: string;
  last_cost?: number;
  last_cost_timestamp?: string;
}

const parseMemoryGiB = (memory: string): number => 
  parseInt(memory.replace('Mi', '')) / 1024;

const parseCPUCores = (cpu: string): number => 
  parseInt(cpu.replace('m', '').replace('n', '')) / 1000 / 1000 / 1000;

export function Dashboard() {
  const { apiCall } = useApi();

  const { data: vmMetrics, isLoading, isError } = useQuery<VMMetrics[]>(
    'vmMetrics',
    () => apiCall<VMMetrics[]>("GET", "/vms/metrics").then(res => res || [])
  );

  if (isLoading) return <Loading />;
  if (isError || !vmMetrics) return <p>Error loading VM metrics</p>;

  // Prepare chart data
  const cpuData = vmMetrics.map(vm => ({
    name: vm.vm_name,
    cpu: parseCPUCores(vm.cpu_usage)
  }));

  const memoryData = vmMetrics.map(vm => ({
    name: vm.vm_name,
    value: parseMemoryGiB(vm.memory_usage)
  }));

  const costData = vmMetrics
    .filter(vm => vm.last_cost && vm.last_cost_timestamp)
    .map(vm => ({
      vm: vm.vm_name,
      cost: vm.last_cost,
      date: new Date(vm.last_cost_timestamp!).toLocaleDateString()
    }));

  // Calculate totals
  const totalVMs = vmMetrics.length;
  const totalMemory = memoryData.reduce((sum, vm) => sum + vm.value, 0);
  const totalCPU = cpuData.reduce((sum, vm) => sum + vm.cpu, 0);
  const totalCost = vmMetrics.reduce((sum, vm) => sum + (vm.last_cost || 0), 0);

  // Color palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="dashboard-container">
      <div className="main-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total VMs</h3>
          <p className="stat-value">{totalVMs}</p>
        </div>
        <div className="stat-card">
          <h3>Total Memory</h3>
          <p className="stat-value">{totalMemory.toFixed(1)} GiB</p>
        </div>
        <div className="stat-card">
          <h3>Total CPU</h3>
          <p className="stat-value">{totalCPU.toFixed(1)} Cores</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Cost</h3>
          <p className="stat-value">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Container */}
      <div className="charts-container">
        {/* CPU Usage Bar Chart */}
        <div className="chart-wrapper">
          <h3>CPU Usage (Cores)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis width={80} />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(2), 'Cores']}
              />
              <Legend />
              <Bar dataKey="cpu" fill="#8884d8" name="CPU Cores" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Donut Chart */}
        <div className="chart-wrapper">
          <h3>Memory Distribution (GiB)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={memoryData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {memoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toFixed(1), 'GiB']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Line Chart */}
        <div className="chart-wrapper">
          <h3>Cost Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value}`} width={80} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} />
              <Legend />
              {vmMetrics.map((vm, index) => (
                <Line
                  key={vm.vm_id}
                  type="monotone"
                  dataKey="cost"
                  data={costData.filter(d => d.vm === vm.vm_name)}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  name={vm.vm_name}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}