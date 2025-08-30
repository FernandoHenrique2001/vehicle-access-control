import React from "react";
import { BrowserRouter } from "react-router-dom"; // Using HashRouter
import { AuthProvider } from "./viewModels/useAuthViewModel";
import AppRouter from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
