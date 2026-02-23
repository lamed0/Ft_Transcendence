// App.jsx (or your main component)
import React, {use, useState} from 'react';
import Button from './AuthBtn.jsx';
import { useNavigate } from 'react-router-dom';

function AppLogin() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [invUserOrPass, setInvUserOrPass] = useState(false);
    const [emailNotVerified, setEmailNotVerified] = useState(false);
    const [dataLogin, setDataLogin] = useState({});
	const navigate = useNavigate();

    const checkCreds = async () => {
        const FormData = {
            username: username,
            password: password
        };
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(FormData),
        });
        const data = await response.json();
        setDataLogin(data);
        if (response.ok) {
            if (data.message === "2FA_REQUIRED"){
                setStep(2);
            } else {
                navigate("/Home");
            }
        } else if (data.message === "Please verify your email before logging in.") {
            setEmailNotVerified(true);
        } else {
            setInvUserOrPass(true);
        }
    }
    
    const checkCode = async () => {
        console.log(code);
        const response = await fetch('/api/auth/2fa/validate-code', {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "twoFactorAuthenticationCode": code , "userId": dataLogin.userId }),
        });
        if (response.ok){
            const response = await fetch('/api/auth/2fa/authenticate', {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "twoFactorAuthenticationCode": code , "userId": dataLogin.userId }),
            });
            if(response.ok)
            navigate("/Home");
        }
    }
  return (
    <div  className="h-screen bg-gradient-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen flex items-center justify-center text-white">
        {step === 1 && (
        <div className=" max-h-[80vh] overflow-y-auto bg-black/50 border-2 border-[#00FFFF] rounded-[40px] p-10 " >
            <h1 className="font-pixel text-transparent [-webkit-text-stroke:3px_#00FFFF] text-[50px] uppercase ">Login</h1>
            <form action="home.html">
                <div className="mt-15">
                    <label htmlFor="username" className="p-2 font-pixel  text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Username</label><br/>
                    {invUserOrPass && (
                        <p className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">Invalid username or password.</p>
                    )}
                    {emailNotVerified && (
                        <p className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">Please verify your email before logging in.</p>
                    )}
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your Username..." className="text-[20px] font-pixel text-white bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/>
                </div>
                <div className="mt-5">
                    <label htmlFor="password" className="font-pixel text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Password</label><br/>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password..."  className="text-[20px] font-pixel text-white bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/><br/><br/>
                </div>
                <button type="button" value="Login" onClick={checkCreds} className="mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-pixel text-2xl uppercase tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]">Continue</button>
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
                            <path d="M47.5391 19.5474H24.5112V28.7747H37.7431C37.5304 30.0805 37.0528 31.3652 36.3534 32.5366C35.552 33.8786 34.5613 34.9004 33.5459 35.6785C30.5042 38.0093 26.958 38.4859 24.4952 38.4859C18.2738 38.4859 12.9581 34.4649 10.9002 29.0011C10.8172 28.8029 10.762 28.5981 10.6949 28.3956C10.2401 27.005 9.99169 25.5323 9.99169 24.0015C9.99169 22.4084 10.2607 20.8835 10.7513 19.4432C12.6864 13.7628 18.122 9.52012 24.4997 9.52012C25.7824 9.52012 27.0178 9.67282 28.1892 9.97738C30.8665 10.6734 32.7603 12.0442 33.9207 13.1286L40.9225 6.27151C36.6634 2.36633 31.1111 5.90435e-09 24.488 5.90435e-09C19.1933 -0.000113959 14.305 1.64956 10.2992 4.43757C7.05062 6.69857 4.38633 9.72576 2.58825 13.2415C0.915782 16.5013 0 20.1138 0 23.9979C0 27.8822 0.917181 31.5322 2.58966 34.7619V34.7837C4.3562 38.2124 6.93949 41.1646 10.0792 43.4152C12.8221 45.3814 17.7403 48 24.488 48C28.3684 48 31.8075 47.3005 34.8405 45.9893C37.0285 45.0435 38.9671 43.8098 40.7222 42.2244C43.0413 40.1294 44.8575 37.5382 46.0972 34.557C47.3369 31.5757 48 28.2044 48 24.5493C48 22.8471 47.829 21.1184 47.5391 19.5473V19.5474Z" fill="white"/>
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
                    <Button provider="42">
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
        )}
        {step === 2 && (
            <div className=" max-h-[80vh] max-w-[90vh] overflow-y-auto bg-black/50 border-2 border-[#00FFFF] rounded-[40px] p-10 " >
                <h1 className="p-2 font-pixel  text-[30px] text-[#00FFFF]">verification code</h1>
                <div className='flex'>
                    <div className='my-auto'>
                        <p className='font-pixel py-3'>enter the 6-digit security code sent to your email</p>
                        <input type="text" id="otp" name="otp" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter the 6-digit code" className="text-[20px] font-pixel text-white bg-black border-2 border-[#00FFFF] rounded-[40px] my-3 p-2 w-full"/>
                    </div>
                </div>
                <button type="button" value="Login" onClick={checkCode} className="mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-pixel text-2xl uppercase tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]">Login</button>
            </div>
        )}
    </div>
    
  );
}

export default AppLogin;