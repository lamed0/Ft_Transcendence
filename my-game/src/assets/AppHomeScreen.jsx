// App.jsx (or your main component)
import React from 'react';
import Button from './button'; // Import the component we just made
import MainPic from './MainPic.jsx';
import Buttons from './button.jsx';

function AppHomeScreen() {
  return (
    <div className="bg-gradient-to-t from-[#861386] to-[#170D26] min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-x-hidden">
        {/* Main Illustration Section */}
        <MainPic />
        
        {/* Navigation Section */}
        <Buttons />
    </div>
  );
}

export default AppHomeScreen;