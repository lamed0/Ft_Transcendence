// App.jsx (or your main component)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppHomeScreen from "./AppHomeScreen.jsx";
import AppLogin from "./AppLogin.jsx";
import AppSignUp from "./AppSignUp.jsx";
import AppHome from "./AppHome.jsx";
import AppCoop from "./AppCoop.jsx";
import AppPolicy from "./AppPolicy.jsx";
import AppOption from "./AppOption.jsx";
import NotFound from "./AppNotFound.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHomeScreen />} />
        <Route path="/Login" element={<AppLogin />} />
        <Route path="/SignUp" element={<AppSignUp />} />
        <Route path="/Home" element={<AppHome />} />
        {/* <Route path="/Friends" element={<AppFriends />} /> */}
        <Route path="/CoopGameLobby" element={<AppCoop />} />
        <Route path="/PrivacyPolicy" element={<AppPolicy />} />
        <Route path="/Option" element={<AppOption />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
