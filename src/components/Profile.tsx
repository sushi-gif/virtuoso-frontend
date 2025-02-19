import {  NavLink, Outlet } from "react-router-dom";
import "../style/settings.css";
import { useApi } from "../utils/Hooks";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Loading } from "./Loading";
import "../style/settings.css";
import "../style/profile.css";
import { useState } from "react";

interface User {
  remoteAddress: string;
  authMethod: string;
  userInfo: UserInfo;
}

interface UserInfo {
  username: string;
  email: string;
  groups: string[];
}


interface ApiTokenInfo {
  token: string;
  issuer: string;
  scopes: string[];
  created: string;
  expires: string;
  revoked: string;
}

export function ProfileTokens() {
  const { apiCall } = useApi();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expires, setExpires] = useState("");
  const [ids, setIds] = useState("");
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);

  const tokens = useQuery("tokens", () => {
    return apiCall<ApiTokenInfo[]>("GET", "/v1/token");
  });

  const createTokenMutation = useMutation(
    (newTokenData: { scopes: string; expires: string }) =>
      apiCall<ApiTokenInfo>("POST", "/v1/token", {}, newTokenData),
    {
      onSuccess: () => {
        setShowModal(false);
        setSelectedScopes([]);
        setExpires("");
        setIds("");
        queryClient.invalidateQueries("tokens");
      },
      onError: (error) => {
        console.error("Error creating token:", error);
      },
    }
  );

  const deleteTokenMutation = useMutation(
    (token: string) => apiCall<void>("DELETE", `/v1/token/${token}`),
    {
      onSuccess: () => {
        setShowDeleteModal(false);
        setTokenToDelete(null);
        queryClient.invalidateQueries("tokens");
      },
      onError: (error) => {
        console.error("Error deleting token:", error);
      },
    }
  );

  const handleScopeChange = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreateToken = () => {
    let finalScopes: string[] = [];

    if (ids && ids.trim() !== "") {
      const idList = ids.split(",").map((id) => id.trim());
      selectedScopes.forEach((scope) => {
        if (scope.includes("[id]")) {
          idList.forEach((id) => {
            finalScopes.push(scope.replace("[id]", id));
          });
        } else {
          finalScopes.push(scope);
        }
      });
    } else {
      finalScopes = selectedScopes;
    }

    // Join scopes into a comma-separated string
    const serializedScopes = finalScopes.join(",");
    createTokenMutation.mutate({ scopes: serializedScopes, expires });
  };

  const handleDeleteToken = (token: string) => {
    setTokenToDelete(token);
    setShowDeleteModal(true);
  };

  const confirmDeleteToken = () => {
    if (tokenToDelete) {
      deleteTokenMutation.mutate(tokenToDelete);
    }
  };

  if (tokens.isLoading) return <Loading />;
  if (tokens.isError) return <p>An error occurred while loading tokens</p>;

  const scopesOptions = [
    "pages.*.read",
    "pages.*.write",
    "pages.[id].read",
    "pages.[id].write",
    "pages.[id].preview",
    "vm.*.read",
    "vm.*.write",
    "vm.[id].read",
    "vm.[id].manage",
    "vm.[id].console",
    "cdn.read",
    "cdn.write",
    "volumes.*.read",
    "volume.*.write",
    "volumes.[id].read",
    "volumes.*.write",
    "volume.*.*",
  ];

  const needsIdInput = selectedScopes.some((scope) => scope.includes("[id]"));

  function formatDate(creation: string) {
    const creationDate = new Date(Date.parse(creation));
    const date = creationDate.getDate().toString().padStart(2, "0");
    const month = (creationDate.getMonth() + 1).toString().padStart(2, "0");
    const year = creationDate.getFullYear();
    return `${date}/${month}/${year}`;
  }

  return (
    <>
      <div className="content-header">
        <div className="content-header-intro">
          <h2>Integrations and Tokens</h2>
          <p>Supercharge your workflow and connect the tools you use every day.</p>
        </div>
        <div className="content-header-actions">
          <a href="#" className="button">
            <i className="ph-faders-bold"></i>
            <span>Filters</span>
          </a>
          <button className="button" onClick={() => setShowModal(true)}>
            <i className="ph-plus-bold"></i>
            <span>Create Token</span>
          </button>
        </div>
      </div>

      <table className="token-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Scopes</th>
            <th>Creation</th>
            <th>Expiry</th>
            <th>Revoke</th>
          </tr>
        </thead>
        <tbody>
          {tokens.data!.map((token) => (
            <tr key={token.token}>
              <td>{token.token}</td>
              <td>{token.scopes.join(", ")}</td>
              <td>{formatDate(token.created)}</td>
              <td>{formatDate(token.expires)}</td>
              <td>
              {token.revoked !== null ? (
                <div>Revoked on {formatDate(token.revoked)}</div>
              ) : (
                <a style={{textDecoration: "underline", cursor: "pointer"}} onClick={() => handleDeleteToken(token.token)}>Revoke now</a>
              )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Token</h3>
              <button
                className="modal-close-button"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="expires">Expiration Date</label>
                <input
                  type="date"
                  id="expires"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Scopes</label>
                <ul className="scopes-list">
                  {scopesOptions.map((scope) => (
                    <li key={scope}>
                      <input
                        type="checkbox"
                        id={`scope-${scope}`}
                        value={scope}
                        checked={selectedScopes.includes(scope)}
                        onChange={() => handleScopeChange(scope)}
                      />
                      <label htmlFor={`scope-${scope}`}>{scope}</label>
                    </li>
                  ))}
                </ul>
              </div>
              {needsIdInput && (
                <div className="form-group">
                  <label htmlFor="ids">Enter IDs (comma-separated)</label>
                  <input
                    type="text"
                    id="ids"
                    value={ids}
                    onChange={(e) => setIds(e.target.value)}
                    placeholder="e.g., 123,456,789"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="button"
                onClick={handleCreateToken}
                disabled={
                  selectedScopes.length === 0 ||
                  !expires ||
                  (needsIdInput && !ids)
                }
              >
                Create Token
              </button>
              <button
                className="button button-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                className="modal-close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this token?</p>
            </div>
            <div className="modal-footer">
              <button className="button" onClick={confirmDeleteToken}>
                Delete
              </button>
              <button
                className="button button-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export function ProfileGeneral() {
  const { apiCall } = useApi();

  const user = useQuery("user", () => {
    return apiCall<User>("GET", "/info");
  });

  if (user.isLoading) return <Loading />;
  if (user.isError) return <p>An error occurred while loading user information</p>;

  return (
    <>
      <div className="content-header">
        <div className="content-header-intro">
          <h2>General Information</h2>
          <p>You cannot directly edit your information due to OIDC.</p>
        </div>
      </div>
      <div className="content wide-l grid-2">
        <div className="content-main">
          <div className="card-grid">
            <div className="search wide-input">
              <label>Email</label>
              <input type="text" value={user.data?.userInfo.email} disabled />
            </div>
            <div className="search wide-input">
              <label>Username</label>
              <input type="text" value={user.data?.userInfo.username} disabled />
            </div>
            <div className="search wide-input">
              <label>Groups</label>
              <input type="text" value={user.data?.userInfo.groups.join(", ")} disabled />
            </div>
            <div className="search wide-input">
              <label>Current IP Address</label>
              <input type="text" value={user.data?.remoteAddress} disabled />
            </div>
            <div className="search wide-input">
              <label>Current Auth Method</label>
              <input type="text" value={user.data?.authMethod} disabled />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Profile() {
  return (
    <>
      <div className="main-header" >
        <h1>Profile</h1>
      </div>
      <div className="horizontal-tabs">
        <NavLink to="general" className={({ isActive }) => (isActive ? 'active' : '')}>
          General Information
        </NavLink>
        <NavLink to="tokens" className={({ isActive }) => (isActive ? 'active' : '')}>
          Tokens
        </NavLink>
      </div>
      <Outlet />
    </>
  );
}
