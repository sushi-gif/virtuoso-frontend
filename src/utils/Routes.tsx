import React from "react";
import {createBrowserRouter, NavLink, RouteObject} from "react-router-dom";
import { Settings } from "../components/Settings";
import { VM, VmCosts, VMs, VMSettings, VMSnapshots, VMVnc, VMVolumes } from "../components/VirtualMachines";
import { Profile } from "../components/Profile";
import { Claude } from "../components/Claude";
import App from "../App";
import { User, Users } from "../components/Users";
import { Dashboard } from "../components/Dashboard";
import { Template, Templates } from "../components/Templates";


export const router = createBrowserRouter([
  {
    element: <App />,
    children:[
      { 
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/vm",
        element: <VMs />,
      },
      {
        path: "/vm/:id",
        element: <VM />,
        children: [
          { path: "vnc", element: <VMVnc /> },
          { path: "settings", element: <VMSettings /> },
          { path: "volumes", element: <VMVolumes /> },
          { path: "snapshots", element: <VMSnapshots /> },
          { path: "costs", element: <VmCosts /> },
        ]
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/mcp",
        element: <Claude />
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/users/:id",
        element: <User />
      },
      {
        path: "/templates",
        element: <Templates />
      },
      {
        path: "/templates/:id",
        children: [
          { path: "view", element: <Template />}
        ]
      },
      {
        path: "/",
        element: <Dashboard />
      }
    ]
  }
]);
