import { useAuth } from "./auth/auth";
import {LoginView} from "./components/LoginView";
import { ToastContainer } from "react-toastify";
import "./style/ui.css";
import { Header } from "./components/Header";
import { Loading } from "./components/Loading";
import { Outlet } from "react-router-dom";

function App() {
  const auth = useAuth();

  if (auth?.isLoading) {
    return (
      <Loading />
    );
  }

  if (!auth?.userData) {
    return <LoginView />;
  }

  return (
    <>
      <Header />
      <main className="main">
        <div className="responsive-wrapper">
          <ToastContainer position="top-center" autoClose={500} />
          <Outlet />
        </div>
      </main>
    </>
  );

}

export default App;
