// App.jsx (or your main component)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Button from './button'; // Import the component we just made
import MainPic from './MainPic.jsx';
import Buttons from './button.jsx';
import AppHomeScreen from './AppHomeScreen.jsx';
import AppLogin from './AppLogin.jsx';
import AppSignUp from './AppSignUp.jsx';
import AppHome from './AppHome.jsx';
import AppFriends from './AppFriends.jsx';
import AppCasual from './AppCasual.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={ <AppHomeScreen/>} />
        <Route path="/Login" element={ <AppLogin/>} />
        <Route path="/SignUp" element={ <AppSignUp/>} />
        <Route path="/Home" element={ <AppHome/>} />
        <Route path="/Friends" element={ <AppFriends/>} />
        <Route path="/CasualGameLobby" element={ <AppCasual/>}/>
      </Routes>
    </Router>

  );
}

export default App;