// Button.jsx
import React from 'react';
import { Link, Navigate } from 'react-router-dom';

function Buttons(props) {

  const addGuest = async () => {
    
			try {

				const response = await fetch('/api/auth/guest', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData), // Turn the object into a string
				});
        const data = await response.json();
				if (response.ok) {
          localStorage.setItem('token', data.token);
          console.log("Guest access granted!");
					Navigate("../Home.html"); // Redirect to home page on success
				} else {
					console.error("Backend rejected the data.");
				}
			} catch (error) {
				console.error("The 'delivery truck' crashed:", error);
			}
  };
  return (
    <div className="m-15 ml-4">
        <Link className="bg-[#FF00E5] text-white px-8 py-4 rounded-full font-pixel text-2xl uppercase tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]" to="/Login">LOGIN</Link>
        <p className="text-white m-[30px] text-[1.25rem]  ">don't have an account ? <Link class="text-blue-500" to="/SignUp">sign up here </Link> or <button onClick={addGuest}  class="text-blue-500">enter as Guest!</button></p>
        <Link to="/Home">dev butt</Link>
    </div>
  );
}
export default Buttons;