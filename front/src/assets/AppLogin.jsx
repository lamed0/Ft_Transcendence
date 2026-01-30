// App.jsx (or your main component)
import React, {use, useState} from 'react';
import Button from './AuthBtn.jsx';
import { Navigate } from 'react-router-dom';

function AppLogin() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const checkCreds = async () => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Login successful!");
            localStorage.setItem('token', data.token);
            Navigate('/Home');
        } else {
            console.error("Login failed.");
        }
    }
  return (
    <div  class="h-screen bg-gradient-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen flex items-center justify-center text-white">
        <div className=" max-h-[80vh] overflow-y-auto bg-black/50 border-2 border-[#00FFFF] rounded-[40px] p-10 " >
            <h1 className="font-pixel text-transparent [-webkit-text-stroke:3px_#00FFFF] text-[50px] uppercase ">Login</h1>
            <form action="home.html">
                <div className="mt-15">
                    <label htmlFor="username" className="p-2 font-pixel  text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Username</label><br/>
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your Username..." className="text-[20px] font-pixel text-white bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/>
                </div>
                <div className="mt-5">
                    <label htmlFor="password" className="font-pixel text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Password</label><br/>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password..."  className="text-[20px] font-pixel text-white bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/><br/><br/>
                </div>
                <button type="button" value="Login" onClick={checkCreds} className="mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-pixel text-2xl uppercase tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]">Login</button>
            </form>
            <div className="flex items-center w-full my-8">
                <div className="grow h-px bg-linear-to-r from-transparent to-gray-600"></div>
                <span className="mx-4 font-pixel text-[10px] text-gray-400 uppercase">or</span>
                <div className="grow h-px bg-linear-to-l from-transparent to-gray-600"></div>
            </div>
            <div className="flex justify-around">
                <form>
                    <Button provider="google">
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_41_185)">
                            <path d="M47.5391 19.5474H24.5112V28.7747H37.7431C37.5304 30.0805 37.0528 31.3652 36.3534 32.5366C35.552 33.8786 34.5613 34.9004 33.5459 35.6785C30.5042 38.0093 26.958 38.4859 24.4952 38.4859C18.2738 38.4859 12.9581 34.4649 10.9002 29.0011C10.8172 28.8029 10.762 28.5981 10.6949 28.3956C10.2401 27.005 9.99169 25.5323 9.99169 24.0015C9.99169 22.4084 10.2607 20.8835 10.7513 19.4432C12.6864 13.7628 18.122 9.52012 24.4997 9.52012C25.7824 9.52012 27.0178 9.67282 28.1892 9.97738C30.8665 10.6734 32.7603 12.0442 33.9207 13.1286L40.9225 6.27151C36.6634 2.36633 31.1111 5.90435e-09 24.488 5.90435e-09C19.1933 -0.000113959 14.305 1.64956 10.2992 4.43757C7.05062 6.69857 4.38633 9.72576 2.58825 13.2415C0.915782 16.5013 0 20.1138 0 23.9979C0 27.8822 0.917181 31.5322 2.58966 34.7619V34.7837C4.3562 38.2124 6.93949 41.1646 10.0792 43.4152C12.8221 45.3814 17.7403 48 24.488 48C28.3684 48 31.8075 47.3004 34.8405 45.9893C37.0285 45.0435 38.9671 43.8098 40.7222 42.2244C43.0413 40.1294 44.8575 37.5382 46.0972 34.557C47.3369 31.5757 48 28.2044 48 24.5493C48 22.8471 47.829 21.1184 47.5391 19.5473V19.5474Z" fill="white"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_41_185">
                            <rect width="48" height="48" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                    </Button>
                </form>
                <form>
                    <Button provider="github">
                        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24.0199 0C10.7375 0 0 10.8167 0 24.1983C0 34.895 6.87988 43.9495 16.4241 47.1542C17.6174 47.3951 18.0545 46.6335 18.0545 45.9929C18.0545 45.4319 18.0151 43.509 18.0151 41.5055C11.3334 42.948 9.94198 38.6209 9.94198 38.6209C8.86818 35.8164 7.27715 35.0956 7.27715 35.0956C5.09022 33.6132 7.43645 33.6132 7.43645 33.6132C9.86233 33.7735 11.1353 36.0971 11.1353 36.0971C13.2824 39.7827 16.7422 38.7413 18.1341 38.1002C18.3328 36.5377 18.9695 35.456 19.6455 34.8552C14.3163 34.2942 8.70937 32.211 8.70937 22.9161C8.70937 20.2719 9.66321 18.1086 11.1746 16.4261C10.9361 15.8253 10.1008 13.3409 11.4135 10.0157C11.4135 10.0157 13.4417 9.3746 18.0146 12.4996C19.9725 11.9699 21.9916 11.7005 24.0199 11.6982C26.048 11.6982 28.1154 11.979 30.0246 12.4996C34.5981 9.3746 36.6262 10.0157 36.6262 10.0157C37.9389 13.3409 37.1031 15.8253 36.8646 16.4261C38.4158 18.1086 39.3303 20.2719 39.3303 22.9161C39.3303 32.211 33.7234 34.2539 28.3544 34.8552C29.2296 35.6163 29.9848 37.0583 29.9848 39.3421C29.9848 42.5871 29.9454 45.1915 29.9454 45.9924C29.9454 46.6335 30.383 47.3951 31.5758 47.1547C41.12 43.9491 47.9999 34.895 47.9999 24.1983C48.0392 10.8167 37.2624 0 24.0199 0Z" fill="white"/>
                        </svg>
                    </Button>
                </form>
                <form>
                    <Button>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 137.6 96.6" fill="#fff" stroke="transparent" width="40" height="32">
                                <path d="M229.2 443.9h50.7v25.4h25.3v-45.9h-50.6l50.6-50.7h-25.3l-50.7 50.7zM316.1 398.1l25.3-25.4h-25.3z" fill="#fff" transform="translate(-229.2 -372.7)">
                                </path>
                                <path d="m341.4 398.1-25.3 25.3v25.3h25.3v-25.3l25.4-25.3v-25.4h-25.4zM366.8 423.4l-25.4 25.3h25.4z" fill="#fff" transform="translate(-229.2 -372.7)">
                                </path>
                            </svg>
                    </Button>
                </form>
            </div>
        </div>
    </div>
    
  );
}

export default AppLogin;