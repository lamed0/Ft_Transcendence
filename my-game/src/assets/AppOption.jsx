import react, { useState, useRef } from "react";
import { Activity, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";


export default function AppOption() {
  const navigate = useNavigate();
  const apiKey = sessionStorage.getItem('apikey');

  const [user, setUser] = useState("");
  const [friends, setFriends] = useState("");
  const [history, setHistory] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account');	
	const [preview, setPreview] = useState(
		user?.avatarBase64
			? `data:${user.avatarMimeType};base64,${user.avatarBase64}`
			: user?.avatarUrl || ''
	);
  const [friendName, setFriendName] = useState("");
  const [inviteFriend, setinviteFriend] = useState("");
  const [isReqRec, setReqRec] = useState(false);
  const [chngUsern, setChngUsern] = useState("");
  const [chngEmail, setChngEmail] = useState("");
  const [chngPassword, setChngPassword] = useState("");
  const [password, setPassword] = useState("");
  const [DeleteAcc, setDeleteAcc] = useState("");
  const [confNewPass, setConfNewPass] = useState("");
  const [error, setError] = useState(false);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [badPassword, setBadPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFa, setTwoFa] = useState('');

  const fileInputRef = useRef(null);
  
  const settingsTabs = [
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'security', label: 'Security' }, // Adding new ones is now easy!
];


//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
    
//     if (file && file.type.startsWith("image/")) {
//       // 1. Instant Preview (Frontend)
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(file);

useEffect(() => {
    let response = async () => {
		let data;
		let res = await fetch("/api/users/me", {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (res.ok) {
			data = await res.json();
			setUser((prev) => data);
			console.log
			console.log(data.isTwoFactorAuthenticationEnabled);
			setIs2FAEnabled(data.isTwoFactorAuthenticationEnabled);
			if (data.isTwoFactorAuthenticationEnabled){
				const res = await fetch('/api/auth/2fa/generate', {
				method: 'POST',
				credentials: "include",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ "userId": data.id })
				});

				const data2 = await res.text();
				if (res.ok) {
					console.log(data2)
					setTwoFa(data2);
				}
			}
			// Connect through nginx proxy to friends service - cookies auto-sent via withCredentials
			const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
			const nginxUrl = `${protocol}://${window.location.host}`;
			
        const friendsocket = io(nginxUrl, {
          path: '/friends/socket.io/',
          namespace: '/friends',
          query: { userId: data.id },
          withCredentials: true,  // Auto-send httpOnly cookies
          transports: ["polling", "websocket"],
        });

        friendsocket.on("friendRequest", (ReqFriend) => {
          setinviteFriend(ReqFriend);
          console.log("jat add friend", inviteFriend.fromUserId);
          setReqRec(true);
        });
      } else {
        if (res.status == 401)
          console.log("sala token")
          res = await fetch("api/auth/refresh", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (res.ok)
            response();
          else if (res.status == 401){
            navigate("/");
            console.log("sala ta refresh");
		}
	}
	res = await fetch("api/friends", {
		method: "GET",
        credentials: "include",
        headers: {
			"Content-Type": "application/json",
        },
	});
	if (res.ok) {
		data = await res.json();
        setFriends(data);
	} else {
		console.log("no data");
    }
	res = await fetch("api/game/history", {
		method: "GET",
        credentials: "include",
        headers: {
			"Content-Type": "application/json",
        },
	});
	if (res.ok) {
		data = await res.json();
        setHistory(data);
	} else {
		console.log("no data");
	}
    };
    response();
  }, []);

const handleLogOut = async () => {
	// Clear session data
	sessionStorage.removeItem('user');
	
	const res = await fetch("/api/auth/logout", {
	  method: "POST",
	  credentials: "include",
	  headers: {
		"Content-Type": "application/json",
	  },
	});
	if (res.ok)
		{
			console.log("logouted");
			navigate("/");
		}
	}
	
	const updateUserData = async (payload, fieldName) => {
		// Handle password change separately
		if (fieldName === "password") {
			try {
				const res = await fetch("/api/auth/change-password", {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						oldPassword: password,
						newPassword: chngPassword,
						confirmPassword: confNewPass,
					}),
				});
				if (res.ok) {
					console.log("Password changed successfully");
					setPassword("");
					setChngPassword("");
					setConfNewPass("");
				} else {
					const error = await res.json();
					console.error("Failed to change password:", error);
				}
			} catch (error) {
				console.error("Error updating password:", error);
			}
			return;
		}

		// For username and email, check if exists first
		const response = await fetch("api/auth/check-exists", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		if (response.ok && data.exists == false){
			console.log("makayen ta wa7d bhad smiya",user.id);
			try {
				const res = await fetch(`/api/public/users/${user.id}`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
				});
				if (res.ok) {
					console.log(`Changed ${fieldName} successfully`);
				} else {
					console.error(`Failed to change ${fieldName}`);
				}
			} catch (error) {
			console.error(`Error updating ${fieldName}:`, error);
		}
	}
	else{
		if (fieldName === "username")
		setUserAlreadyExists(true);
		else if (fieldName === "email")
		setEmailAlreadyExists(true);
		console.log("used username or email");
	}
};
//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
	
//     if (file && file.type.startsWith("image/")) {
//       // 1. Instant Preview (Frontend)
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(file);

//       // 2. Send to Server (Backend)
//       const formData = new FormData();
//       formData.append('avatar', file);

// 	}}

const handleImageChange = async (e) => {
	const file = e.target.files[0];

  if (file && file.type.startsWith("image/")) {
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/users/avatar/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
		setError(false);
        console.log("Upload successful");
        // Optional: If the server returns the new user object, update it here
        // const updatedUser = await res.json();
        // setUser(updatedUser); 
      } else {
		setError(true);
        console.error("Server rejected the upload");
      }
    } catch (err) {
		setError(true);
      console.error("Network error during upload:", err);
    }
  }
};

const handlechangepassword = async () =>{
	const formData = {
		oldPassword : password,           // from step 1
		newPassword : chngPassword,     // from step 2
		confirmPassword: confNewPass          // from step 3
	};
	const res = await fetch("/api/auth/change-password", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			oldPassword: password,
			newPassword: chngPassword,
			confirmPassword: confNewPass,
		}),
	})
	if (res.ok){
		console.log("password changed")
		setBadPassword(false);
	}
	else
		setBadPassword(true);
}

const handleDeleteAcc = async () =>{
	const formData = {
		oldPassword : password         // from step 3
	};
	const res = await fetch("/api/public/users/me", {
		method: "DELETE",
		credentials: "include",
	})
	if (res.ok)
	{
		navigate("/")
	}
}

  const handleGetData = async () => {
    // try {
      // 1. Ask the backend for the file
      const response = await fetch('https://localhost/api/users/me/export', {
        method: 'GET',
        credentials: 'include', 
      });

      if (!response.ok) throw new Error('Failed to export data');

	  else{

		const blob = await response.blob();
		
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
      a.href = url;
      a.download = 'my_pingpong_data.json';
      
      document.body.appendChild(a);
      a.click(); 
	  
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
	}

    // } catch (error) {
    //   console.error('Error downloading data:', error);
    //   alert('Could not download data.');
    // }
  };

const handleToggle2FA = async () => {
	console.log("enabled")
	setIs2FAEnabled(true);
	if (is2FAEnabled){
		console.log("2FA disabled");
		setIs2FAEnabled(false);
		const response = await fetch('/api/auth/2fa/turn-off', {
			method: 'POST',
			credentials: "include",
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}else{
		console.log("2FA enabled");
		setIs2FAEnabled(true);
		const response = await fetch('/api/auth/2fa/turn-on', {
		method: 'POST',
		credentials: "include",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ "userId": user.id })
		});
		if (response.ok) {
		console.log("TEST" , user.id);
		const res = await fetch('/api/auth/2fa/generate', {
		method: 'POST',
		credentials: "include",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ "userId": user.id })
		});

		const data = await res.text();
		if (res.ok) {
			console.log(data)
			setTwoFa(data);
		}
	}}
}


            // const response = await fetch('/api/auth/2fa/generate', {
            // method: 'POST',
            // credentials: "include",
            // headers: {
            //     'Content-Type': 'application/json',
            // },
            // });
	return (
    <div className="flex flex-col min-h-screen bg-gradient-to-t font-pixel from-[#861386] to-[#170D26] to-60% text-white overflow-x-hidden">
        {/* --- NAV BAR --- */}
                <div className="bg-black/50 w-full">
          <div className="w-full">
            <nav className="flex font-pixel w-full max-w-7xl mx-auto px-4 py-2 justify-between items-center backdrop-blur-md relative z-20">
              <div className="flex items-center relative">
                {/* Avatar container adjusted for mobile */}
                <div className="absolute -left-4 sm:-left-12 -bottom-1 bg-black border-2 mt-2 scale-75 sm:scale-100">
                    {!user.avatarUrl && !user.avatarBase64 && (
                      <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M24.0001 8C19.5818 8 16.0001 11.5817 16.0001 16C16.0001 20.4183 19.5818 24 24.0001 24C28.4183 24 32.0001 20.4183 32.0001 16C32.0001 11.5817 28.4183 8 24.0001 8ZM31.282 25.5388C34.15 23.346 36.0001 19.889 36.0001 16C36.0001 9.37258 30.6275 4 24.0001 4C17.3726 4 12.0001 9.37258 12.0001 16C12.0001 19.889 13.8501 23.346 16.7181 25.5388C14.7071 26.4283 12.8571 27.6871 11.2721 29.2721C10.0483 30.4959 9.01875 31.878 8.20361 33.3702C6.69937 36.1238 7.31283 38.9314 9.00685 40.9168C10.6377 42.828 13.2501 44 16.0001 44H32.0001C34.75 44 37.3625 42.828 38.9933 40.9168C40.6873 38.9314 41.3008 36.1238 39.7965 33.3702C38.9814 31.878 37.9518 30.4959 36.728 29.2721C35.1431 27.6872 33.293 26.4283 31.282 25.5388ZM24.0001 28C20.287 28 16.7261 29.475 14.1006 32.1005C13.1486 33.0525 12.3479 34.1273 11.714 35.2879C11.1 36.4117 11.2981 37.4396 12.0497 38.3204C12.8645 39.2753 14.3317 40 16.0001 40H32.0001C33.6684 40 35.1357 39.2753 35.9505 38.3204C36.702 37.4396 36.9001 36.4117 36.2862 35.2879C35.6522 34.1274 34.8516 33.0525 33.8996 32.1005C31.274 29.475 27.7131 28 24.0001 28Z" fill="white"/>
                      </svg>
                    )}
                    {(user.avatarBase64 || user.avatarUrl) && (
                      <img
                        className="w-15 h-15"
                        src={user.avatarBase64
                          ? `data:${user.avatarMimeType};base64,${user.avatarBase64}`
                          : user.avatarUrl}
                        alt=""
                      />
                    )}
                </div>
                {/* User Stats Box */}
                <div className="ml-8 sm:ml-0 border-2 rounded-lg mt-1 flex justify-between gap-4 sm:gap-10 p-2 max-w-[150px] sm:max-w-125 [corner-shape:bevel] border-blue-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  <span className="font-pixel text-xs sm:text-base truncate">{user.username}</span>
                  <span className="font-pixel text-[8px] sm:text-[10px] pt-[4px] sm:pt-[7px] whitespace-nowrap">
                    {user.level}LVL
                  </span>
                </div>
              </div>

              {/* Desktop Nav */}
              <ul className="hidden lg:flex">
                <li className="nav-item">
                  <Link to="/Home" className="text-gray-400 block p-[17px] hover:text-cyan-400">home</Link>
                </li>
                <li className="nav-item"><button className="text-gray-400 block p-[17px] hover:text-white">friends</button></li>
                <li className="nav-item"><button className="text-gray-400 block p-[17px] hover:text-white">stats</button></li>
                <li className="nav-item">
                  <Link to="/Option" className="text-cyan-400 block p-[17px] bg-gradient-to-b to-[#4ae6d9]/50 to-100% [text-shadow:0_0_5px_#00d2ff,0_0_10px_#00d2ff,0_0_20px_#00d2ff]">options</Link>
                </li>
              </ul>

              <div className="flex items-center gap-2">
                {/* Mobile Menu Toggle */}
                <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden flex flex-col justify-center items-center z-50 p-2">
                  <span className={`bg-cyan-400 block transition-all duration-300 h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`bg-cyan-400 block transition-all duration-300 h-0.5 w-6 rounded-sm my-1 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`bg-cyan-400 block transition-all duration-300 h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </button>

                <div className="group flex items-center cursor-pointer" onClick={handleLogOut}>
                  <svg className="fill-white transition-all duration-300 group-hover:fill-red-500 w-8 h-8 sm:w-12 sm:h-12" viewBox="-5.0 -10.0 110.0 135.0">
                    <path d="m64.398 35.828v6.3984h-6.3984v-6.3984zm-6.3984 32h6.3984v-6.3984l-6.3984-0.003907zm-35.199 6.3984v6.3984l32 0.003906v-6.3984zm32-51.199h-32v6.3984h32zm22.398 25.602v-3.1992l-6.3984-0.003907v-3.1992h-6.4023v6.3984l-25.598 0.003906v6.3984h25.598v6.3984h6.3984v-3.1992h6.3984v-3.1992h6.3984v-6.3984zm-60.801-19.199v44.801h6.3984v-44.801zm38.09-10.059"/>
                  </svg>
                  <button className="hidden lg:block transition-all duration-300 text-white group-hover:text-[#ff0000] ml-2 font-pixel">logout</button>
                </div>
              </div>
            </nav>
            {/* Neon Line Divider */}
            <div className="relative w-full h-1">
              <div className="absolute inset-0 h-0.5 bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-md opacity-90"></div>
              <div className="relative h-0.5 bg-linear-to-r from-purple-400 via-cyan-400 to-purple-400"></div>
            </div>
          </div>
        </div>
		{isReqRec && (
		  <FriendInvite 
			sender={inviteFriend.fromUsername} 
			onAccept={handleAccept} 
			onDecline={handleDecline} 
		  />
		)}
        {/* --- SETTINGS BODY --- */}
        <div className="flex flex-col lg:flex-row flex-1 w-full max-w-[1400px] mx-auto">
            {/* Sidebar / Top Tabs */}
            <aside className="w-full lg:w-[250px] shrink-0 bg-[#2b052b]/50 lg:border-r border-pink-500/30">
                {!user.isGuest && (
                    <ul className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:my-5 lg:sticky lg:top-[80px]">
                        {settingsTabs.map((tab) => (
                            <li 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                className={`p-4 cursor-pointer transition-all whitespace-nowrap text-center lg:text-left flex-1 lg:flex-none ${activeTab === tab.id ? 'text-cyan-400 bg-white/10 border-b-2 lg:border-b-0 lg:border-l-2 border-cyan-400' : 'text-white'}`}
                            >
                                {tab.label}
                            </li>
                        ))}
                    </ul>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-[#041a20]/30 p-4 sm:p-8">
                {!user.isGuest ? (
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'account' && (
                            <div className="animate-in fade-in duration-300">
                                <h1 className="text-2xl sm:text-4xl font-pixel mb-6 text-cyan-500">ACCOUNT</h1>
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center bg-black/20 p-6 rounded-lg border border-cyan-500/30">
                                        <img
                                            src={user.avatarBase64 ? `data:${user.avatarMimeType};base64,${user.avatarBase64}` : user.avatarUrl}
                                            className="border-2 border-cyan-400 w-32 h-32 sm:w-40 sm:h-40 object-cover"
                                            alt="avatar"
                                        />
                                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
                                        <button onClick={() => fileInputRef.current.click()} className="mt-4 border-2 border-cyan-500 px-4 py-2 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors">
                                            CHANGE AVATAR
                                        </button>
                                    </div>

                                    {/* Form Section */}
                                    <div className="flex-1 space-y-4">
										<div>
											<label className="block text-cyan-500 text-sm mb-1">USERNAME</label>
											<div className="flex gap-2 max-w-xs">
												<input 
													className="flex-1 border-2 border-cyan-500 rounded bg-transparent py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" 
													value={chngUsern} 
													onChange={(e) => setChngUsern(e.target.value)} 
													type="text" 
												/>
												<button onClick={() => updateUserData({ username: chngUsern }, "username")} className="border-2 border-cyan-500 px-1 py-1 text-xs text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all">
													SAVE
												</button>
											</div>
											{userAlreadyExists && <p className="text-red-500 text-[10px] mt-1 uppercase">Taken</p>}
										</div>
										<div>
											<label className="block text-cyan-500 text-sm mb-1">EMAIL</label>
											<div className="flex gap-2 max-w-xs">
												<input 
													className="flex-1 border-2 border-cyan-500 rounded bg-transparent py-1 text-white text-sm focus:outline-none" 
													value={chngEmail} 
													onChange={(e) => setChngEmail(e.target.value)} 
													type="text" 
												/>
												<button onClick={() => updateUserData({ email: chngEmail }, "email")} className="border-2 border-cyan-500 px-1 py-1 text-xs text-cyan-500 hover:bg-cyan-500 hover:text-black">
													SAVE
												</button>
												{emailAlreadyExists && (
												<>
													<p className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">This email is already taken.</p>
													
												</>
												)}
											</div>
										</div>
									</div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="max-w-md space-y-6">
                                <h1 className="text-2xl sm:text-4xl font-pixel text-cyan-500">PRIVACY</h1>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-cyan-500 mb-1">CURRENT PASSWORD</label>
                                        <input className="w-full border-2 border-cyan-500 rounded bg-transparent p-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                                    </div>
                                    <div>
                                        <label className="block text-cyan-500 mb-1">NEW PASSWORD</label>
                                        <input className="w-full border-2 border-cyan-500 rounded bg-transparent p-2" value={chngPassword} onChange={(e) => setChngPassword(e.target.value)} type="password" />
                                    </div>
                                    <div>
                                        <label className="block text-cyan-500 mb-1">CONFIRM NEW</label>
                                        <input className="w-full border-2 border-cyan-500 rounded bg-transparent p-2" value={confNewPass} onChange={(e) => setConfNewPass(e.target.value)} type="password" />
                                    </div>
									{badPassword && <p className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">Incorrect password or action refused</p>}
                                    <button onClick={handlechangepassword} className="w-full border-2 border-cyan-500 py-2 text-cyan-500 hover:bg-cyan-500 hover:text-black">UPDATE PASSWORD</button>
                                </div>
                            </div>
                        )}
                        {/* Security Tab (Simplified) */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <h1 className="text-2xl sm:text-4xl font-pixel text-cyan-500">SECURITY</h1>
                                <div className="flex flex-col gap-4 items-start">
                                    <button onClick={handleGetData} className="text-white hover:text-cyan-400 border-b border-transparent hover:border-cyan-400 transition-all">
                                        DOWNLOAD MY DATA
                                    </button>
                                    <button onClick={() => setDeleteAcc(true)} className="text-red-400 hover:text-red-600 transition-all">
                                        DELETE ACCOUNT
                                    </button>
                                    <div className="flex items-center gap-4 py-4">
                                        <span>2FA AUTHENTICATION:</span>
                                        <button onClick={handleToggle2FA} className={`px-4 py-1 border-2 font-pixel ${is2FAEnabled ? 'text-green-400 border-green-400' : 'text-gray-500 border-gray-500'}`}>
                                            {is2FAEnabled ? '[ ON ]' : '[ OFF ]'}
                                        </button>
                                    </div>
                                    {twoFa && is2FAEnabled && <img src={twoFa} className="border-4 border-white p-2" alt="QR Code" />}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <p className="text-2xl font-pixel">GUESTS CANNOT ACCESS SETTINGS</p>
                    </div>
                )}
            </main>
        </div>

        {/* --- FOOTER --- */}
        <footer className="bg-[#2b052b] w-full border-t border-cyan-500/30 p-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-6 items-center">
                    <a href="https://github.com/SegfaultSec" className="hover:opacity-50 transition-opacity">
                        <svg width="24" height="24" viewBox="0 0 48 48" fill="white"><path d="M24.0199 0C10.7375 0 0 10.8167 0 24.1983C0 34.895 6.87988 43.9495 16.4241 47.1542C17.6174 47.3951 18.0545 46.6335 18.0545 45.9929C18.0545 45.4319 18.0151 43.509 18.0151 41.5055C11.3334 42.948 9.94198 38.6209 9.94198 38.6209C8.86818 35.8164 7.27715 35.0956 7.27715 35.0956C5.09022 33.6132 7.43645 33.6132 7.43645 33.6132C9.86233 33.7735 11.1353 36.0971 11.1353 36.0971C13.2824 39.7827 16.7422 38.7413 18.1341 38.1002C18.3328 36.5377 18.9695 35.456 19.6455 34.8552C14.3163 34.2942 8.70937 32.211 8.70937 22.9161C8.70937 20.2719 9.66321 18.1086 11.1746 16.4261C10.9361 15.8253 10.1008 13.3409 11.4135 10.0157C11.4135 10.0157 13.4417 9.3746 18.0146 12.4996C19.9725 11.9699 21.9916 11.7005 24.0199 11.6982C26.048 11.6982 28.1154 11.979 30.0246 12.4996C34.5981 9.3746 36.6262 10.0157 36.6262 10.0157C37.9389 13.3409 37.1031 15.8253 36.8646 16.4261C38.4158 18.1086 39.3303 20.2719 39.3303 22.9161C39.3303 32.211 33.7234 34.2539 28.3544 34.8552C29.2296 35.6163 29.9848 37.0583 29.9848 39.3421C29.9848 42.5871 29.9454 45.1915 29.9454 45.9924C29.9454 46.6335 30.383 47.3951 31.5758 47.1547C41.12 43.9491 47.9999 34.895 47.9999 24.1983C48.0392 10.8167 37.2624 0 24.0199 0Z"/></svg>
                    </a>
                    <Link className="text-blue-500 text-xs" to="/PrivacyPolicy">Privacy policy</Link>
                </div>
                <p className="text-[10px] opacity-40">© 2026 PONG PIXEL</p>
            </div>
        </footer>

        {/* Delete Confirmation Overlay */}
        {DeleteAcc && (
            <div onClick={() => setDeleteAcc(false)} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md border-2 border-red-500 rounded bg-black/90 p-6 text-center">
                    <h1 className="text-red-600 text-2xl font-pixel mb-4">DELETE ACCOUNT</h1>
                    <p className="text-red-400 mb-6">Are you sure? This action is irreversible.</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleDeleteAcc} className="border-2 border-red-500 px-4 py-2 text-red-500 hover:bg-red-600 hover:text-black transition-colors">DELETE</button>
                        <button onClick={() => setDeleteAcc(false)} className="border-2 border-gray-500 px-4 py-2 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors">CANCEL</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}