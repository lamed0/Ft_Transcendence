import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Buttons() {
  const navigate = useNavigate();
  
  const addGuest = async () => {
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate("/Home");
      }
    } catch (error) {
      console.error("The 'delivery truck' crashed:", error);
    }
  };

  return (
    <div className="mt-8 md:mt-12 px-4 w-full max-w-md">
      <Link 
        className="inline-block bg-[#FF00E5] text-white px-6 py-3 md:px-10 md:py-4 rounded-full font-pixel text-xl md:text-2xl uppercase tracking-widest border-b-4 md:border-b-8 border-r-4 md:border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_15px_rgba(255,0,229,0.4)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)] w-full md:w-auto" 
        to="/Login"
      >
        LOGIN
      </Link>
      
      <p className="text-white mt-8 text-sm md:text-lg leading-relaxed">
        don't have an account? <br className="block md:hidden" />
        <Link className="text-blue-400 hover:underline" to="/SignUp">sign up here</Link> 
        <span className="mx-2">or</span> 
        <button onClick={addGuest} className="text-blue-400 hover:underline">enter as Guest!</button>
      </p>
    </div>
  );
}

export default Buttons;