// App.jsx (or your main component)
import React from 'react';
import Button from './button'; // Import the component we just made
import MainPic from './MainPic.jsx';
import Buttons from './button.jsx';

function AppHomeScreen() {

  return (
    <div className="bg-gradient-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen flex items-center justify-center flex-col">
        <MainPic/>
        <Buttons/>
    </div>
    

  );
}

export default AppHomeScreen;