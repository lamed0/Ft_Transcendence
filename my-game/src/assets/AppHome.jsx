import { Activity, useEffect } from "react";
import react, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenderFriends from "./renderLists";
import FriendInvite from "./FriendinvNot";
import MatchHistory from "./AppHistoryRen";
import { io } from "socket.io-client";

export default function AppHome() {
  const navigate = useNavigate();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [step, setStep] = useState(1);
  const [user, setUser] = useState("");
  const [isCoop, setIsCoop] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isFound, setIsFound] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [friends, setFriends] = useState("");
  const [history, setHistory] = useState("");
  const [addFriend, setaddFriend] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [matchState, setMatchState] = useState("IDLE")
  const [friendName, setFriendName] = useState("");
  const [inviteFriend, setinviteFriend] = useState("");
  const [isReqRec, setReqRec] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notFound, setNotFound] = useState(false)
  const [yourself, setYourself] = useState(false)
  const [already, setAlready] = useState(false)
  const [alrFriends, setAlrFriends] = useState(false)

  const socket = useRef(null);  // Friends socket on /friends namespace
  const gameSocket = useRef(null);  // Game/matchmaking socket on /game namespace
  useEffect(() => {
    // Don't create a new socket if one already exists
    if (socket.current?.connected) {
      console.log("✅ Socket already connected, reusing existing connection");
      setSocketInitialized(true);
      return;
    }

    let response = async () => {
      let data;
      let res = await fetch(`/api/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
          console.log('GET /api/users/me status =', res.status);
          const userData = await res.json();
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
          
          // Create socket through nginx proxy (same origin, no CORS issues)
          const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
          const socketUrl = `${protocol}://${window.location.host}`;  // Goes through nginx
          
          console.log("📡 CREATING SOCKET CONNECTION");
          console.log("   Base URL:", socketUrl);
          console.log("   Namespace: /friends");
          
          socket.current = io(socketUrl, {
              path: '/friends/socket.io/',
              namespace: '/friends',
              query: { userId: userData.id },
              withCredentials: true,
              transports: ["polling", "websocket"],
              reconnection: true,
              reconnectionDelay: 500,
              reconnectionDelayMax: 5000,
              reconnectionAttempts: Infinity,
          });
          
          console.log("📡 Friends socket created, waiting for events...");
          
          // socket.current.on("connect", () => {
          //   console.log("✅✅✅ SOCKET CONNECTED SUCCESSFULLY!");
          //   setSocketInitialized(true);
          // });
          
          socket.current.on("connect_error", (error) => {
            console.error("❌❌❌ SOCKET CONNECTION ERROR:");
            console.error(error);
          });
          
          socket.current.on("disconnect", (reason) => {
            console.warn("⚠️ SOCKET DISCONNECTED:", reason);
            // After disconnect, ensure reconnection is enabled
            if (socket.current && reason !== "io server disconnect") {
              setTimeout(() => {
                if (socket.current && !socket.current.connected) {
                  console.log("🔄 Attempting to reconnect...");
                  socket.current.connect();
                }
              }, 500);
            }
          });
          
          socket.current.on("reconnect_attempt", () => {
            console.log("🔄 SOCKET RECONNECTING...");
          });
          
          socket.current.on("reconnect", () => {
            console.log("✅ SOCKET RECONNECTED!");
            setSocketInitialized(true);
          });

          socket.current.on("friendRequest", (ReqFriend) => {
            setinviteFriend(ReqFriend);
            setReqRec(true);
          });

          // socket.current.on("mm.matched", (data) => {
          //   console.log("MATCH SIGNAL RECEIVED", data.sessionId);
          //   setMatchState("MATCHED");
          //   const params = new URLSearchParams({
          //       match_data: JSON.stringify(data), 
          //   });
          //   setOpponent(data.opponent);
          //   setIsFound(true);
          //   setTimeout(() => {
          //     window.location.href = `http://localhost:8082/?${params.toString()}`
          //   }, 3000);
          // });

      } else {
        if (res.status == 401)
          console.log("sala token")
          res = await fetch("/api/auth/refresh", {
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
      res = await fetch("/api/friends", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
        data = await res.json();
        setFriends(data);
      } else {
        console.log("no data");
      }
      res = await fetch("/api/game/history", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
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

      // Cleanup on unmount only (not on re-renders)
      return () => {
        // Don't disconnect - let socket.io handle reconnection automatically
        // socket.current.disconnect() will be called when user logs out
      };
  }, []);  // Empty array = run only once on mount
  const handleStep = () => {
    setStep(2);
  };

  const handleCoop = () => {
    setIsCoop(true);
    setStep(3);
    navigate("/CoopGameLobby");
  };

const startSearch = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const socketUrl = `${protocol}://${window.location.host}`;

  console.log("🔌 Creating game socket...");
  console.log("   URL:", socketUrl);
  console.log("   Namespace: /game");

  gameSocket.current = io(socketUrl, {
    namespace: '/game',
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });
  
  setStep(3);
  setIsOnline(true);

  gameSocket.current.on("connect", () => {
    setMatchState('SEARCHING');
    console.log("✅ Connected to /game namespace - socket ID:", gameSocket.current.id);
    
    // Test with a ping first
    console.log("📤 Sending test ping...");
    gameSocket.current.emit("ping");
    
    // Then send mm.join after a small delay
    setTimeout(() => {
      console.log("📤 Emitting mm.join...+++");
      gameSocket.current.emit("mm.join");
    }, 500);
  });

  gameSocket.current.on("pong", (data) => {
    console.log("📥 PONG received! Timestamp:", data.timestamp);
    console.log("✅ Socket messages are working!");
  });

  gameSocket.current.on("mm.response", (data) => {
    console.log("📥 mm.response received:", data);
    if (data.status === 'SEARCHING') {
      console.log("⏳ Waiting for opponent...");
    } else if (data.status === 'MATCHED') {
      console.log("🎮 Match found!");
    }
  });

  gameSocket.current.on("mm.matched", (data) => {
    console.log("🎮 MATCH SIGNAL RECEIVED BY BROADCAST", data.sessionId);
    setMatchState("MATCHED");
    const params = new URLSearchParams({
        match_data: JSON.stringify(data), 
    });
    setOpponent(data.opponent);
    setIsFound(true);
    setTimeout(() => {
      window.location.href = `https://localhost/ping/?${params.toString()}`
    }, 3000);
  });

  gameSocket.current.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
    console.error("❌ Error details:", err);
  });

  gameSocket.current.on("disconnect", (reason) => {
    console.warn("⚠️ Disconnected:", reason);
  });
};

  console.log("friends: ", friends)

const cancelSearch = async () => {
    const s = socket.current;
    if (!s) return;

    // Call the REST API to leave the matchmaking queue
    try {
      await fetch("/api/game/matchmaking/leave", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      // Optionally handle error
      console.error("Failed to leave matchmaking queue:", e);
    }

    // DON'T disconnect - we might search again immediately
    // socket.current.disconnect() will only be called on logout
    setMatchState("IDLE");
    setIsOnline(false);
};

const handleAddFriend = async () => {
  const apiKey = sessionStorage.getItem('apiKey')
    const res = await fetch("/api/public/users/search", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify({ "query": friendName }),
    });
    if (res.ok){
      const data = await res.json();
      const res2 = await fetch(`/api/public/friends/request/${data.data[0].id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data2 = await res2.json();
      if (res2.ok){

        console.log("sent")
        setNotFound(false);
        setYourself(false);
        setAlready(false);
        setAlrFriends(false);
      }else{
        console.log(data2)
        if (data2.message === "Cannot friend yourself"){
          console.log("no player with this username1!")
          setNotFound(false);
          setYourself(true);
          setAlready(false);
          setAlrFriends(false);
        }
        else if (data2.message === "Request already sent"){
          console.log("no player with this username!2")
          setAlrFriends(false);
          setAlready(true);
          setNotFound(false);
          setYourself(false);
        }
        else if (data2.message === 'Already friends')
        {
          console.log("no player with this username3!")
          setAlrFriends(true);
          setAlready(false);
          setNotFound(false);
          setYourself(false);
        }
        else{
          setNotFound(true);
          setYourself(false);
          setAlready(false);
          setAlrFriends(false);
          console.log("no player with this username4!")
        }
      }
    }
    else{
      setYourself(false);
      setNotFound(true);
      setAlready(false);
      console.log("no player with this username!")
    }
};

const handleLogOut = async () => {
    // Disconnect socket
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    
    // Clear session data
    sessionStorage.removeItem('user');
    setSocketInitialized(false);
    setUser("");
    setFriends("");
    setHistory("");
    
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

const handleAccept = async () => {
    const res = await fetch(`/api/friends/request/${inviteFriend.fromUserId}/accept`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok)
      setReqRec(null); // Hide the toast
};

const handleDecline = async () => {
    const res = await fetch(`/api/friends/request/${inviteFriend.fromUserId}/decline`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok)
      setReqRec(null); // Hide the toast
};

  return (
  <>
    <div className="flex flex-col bg-linear-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen text-white">
      <div className="flex flex-col min-h-screen">
        {/* --- HEADER / NAV --- */}
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
                  <Link to="/Home" className="text-cyan-400 block p-[17px] bg-gradient-to-b to-[#4ae6d9]/50 to-100% [text-shadow:0_0_5px_#00d2ff,0_0_10px_#00d2ff,0_0_20px_#00d2ff]">home</Link>
                </li>
                <li className="nav-item"><button className="text-gray-400 block p-[17px] hover:text-white">friends</button></li>
                <li className="nav-item"><button className="text-gray-400 block p-[17px] hover:text-white">stats</button></li>
                <li className="nav-item">
                  <Link to="/Option" className="text-gray-400 block p-[17px] hover:text-cyan-400">options</Link>
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
        {/* --- MOBILE OVERLAY MENU --- */}
        <div className={`fixed inset-0 bg-black/95 transition-all duration-300 z-[100] flex flex-col items-center justify-center font-pixel ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} lg:hidden`}>
          <ul className="text-center space-y-8 text-2xl uppercase tracking-tighter text-white">
            <Link to='/Home' className="block hover:text-cyan-400" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to='' className="block hover:text-cyan-400" onClick={() => setIsOpen(false)}>Friends</Link>
            <Link to='' className="block hover:text-cyan-400" onClick={() => setIsOpen(false)}>Stats</Link>
            <Link to='/Option' className="block hover:text-cyan-400" onClick={() => setIsOpen(false)}>Options</Link>
            <li className="text-red-500" onClick={() => setIsOpen(false)}>Close</li> 
          </ul>
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
          {/* Hero / Start Game Section */}
          <div className="h-[25vh] sm:h-[35vh] w-full mb-12">
            <div
              style={{ backgroundImage: "url('../../public/unnamed.jpg')" }}
              className="relative flex justify-center items-end w-full h-full bg-cover bg-center rounded-lg border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <button
                onClick={handleStep}
                className="absolute bottom-0 translate-y-1/2 z-10 px-6 sm:px-16 py-3 sm:py-4 text-lg sm:text-2xl font-pixel text-white uppercase tracking-widest bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.7)]"
              >
                Start Game
              </button>
            </div>
          </div>

          {/* Friends & History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-16">
            {/* Friends Card */}
            <div className="bg-black/40 h-[40vh] overflow-y-auto border-2 border-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <div className="sticky top-0 z-10 flex justify-between items-center bg-[#861386] p-4 font-pixel text-lg sm:text-2xl text-cyan-400">
                FRIENDS
                <button 
                  onClick={() => setaddFriend(true)}
                  className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-cyan-400/20 text-xl flex items-center justify-center hover:bg-cyan-400 hover:text-purple-900"
                >
                  +
                </button>
              </div>
              <div className="p-2">
                {Object.keys(friends).length === 0 ? <p className="text-white/50 py-4">No friends available</p> : <RenderFriends friends={friends} />}
              </div>
            </div>

            {/* History Card */}
            <div className="bg-black/40 h-[40vh] overflow-y-auto border-2 border-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <div className="sticky top-0 z-10 bg-[#861386] p-4 font-pixel text-lg sm:text-2xl text-cyan-400">
                HISTORY
              </div>
              <div className="p-2">
                {Object.keys(history).length === 0 ? <p className="text-white/50 py-4">No match history available</p> : <MatchHistory matchData={history} currentUserId={user.id}/>}
              </div>
            </div>
          </div>
        </main>

        {/* --- FOOTER --- */}
        <footer className="mt-auto bg-[#2b052b] font-pixel border-t border-cyan-500/30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <a href="https://github.com/SegfaultSec" className="hover:opacity-50 transition-opacity">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="white"><path d="M24.0199 0C10.7375 0 0 10.8167 0 24.1983C0 34.895 6.87988 43.9495 16.4241 47.1542C17.6174 47.3951 18.0545 46.6335 18.0545 45.9929C18.0545 45.4319 18.0151 43.509 18.0151 41.5055C11.3334 42.948 9.94198 38.6209 9.94198 38.6209C8.86818 35.8164 7.27715 35.0956 7.27715 35.0956C5.09022 33.6132 7.43645 33.6132 7.43645 33.6132C9.86233 33.7735 11.1353 36.0971 11.1353 36.0971C13.2824 39.7827 16.7422 38.7413 18.1341 38.1002C18.3328 36.5377 18.9695 35.456 19.6455 34.8552C14.3163 34.2942 8.70937 32.211 8.70937 22.9161C8.70937 20.2719 9.66321 18.1086 11.1746 16.4261C10.9361 15.8253 10.1008 13.3409 11.4135 10.0157C11.4135 10.0157 13.4417 9.3746 18.0146 12.4996C19.9725 11.9699 21.9916 11.7005 24.0199 11.6982C26.048 11.6982 28.1154 11.979 30.0246 12.4996C34.5981 9.3746 36.6262 10.0157 36.6262 10.0157C37.9389 13.3409 37.1031 15.8253 36.8646 16.4261C38.4158 18.1086 39.3303 20.2719 39.3303 22.9161C39.3303 32.211 33.7234 34.2539 28.3544 34.8552C29.2296 35.6163 29.9848 37.0583 29.9848 39.3421C29.9848 42.5871 29.9454 45.1915 29.9454 45.9924C29.9454 46.6335 30.383 47.3951 31.5758 47.1547C41.12 43.9491 47.9999 34.895 47.9999 24.1983C48.0392 10.8167 37.2624 0 24.0199 0Z"/></svg>
              </a>
              <Link className="text-blue-500 text-sm" to="/PrivacyPolicy">Privacy policy</Link>
            </div>
            <p className="text-[10px] text-white/40">© 2026 PONG PIXEL</p>
          </div>
        </footer>
      </div>
    </div>
    {step === 2 && (
        <div onClick={() => setStep(1)} className="font-pixel text-center fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full">
          <div onClick={(e) => e.stopPropagation()} className="h-[50vh] flex flex-2 gap-8 p-10 max-w-6xl overflow-y-auto">
            <div onClick={handleCoop} className=" flex flex-col flex-2 overflow-hidden bg-[#861386]/50 p-6 items-center rounded-2xl [corner-shape:bevel] border-3 border-cyan-500 hover:scale-105 transition-transform cursor-pointer text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <h2 className="text-4xl  font-bold mb-4 text-cyan-500 [text-shadow:_0_0_5px_#00d2ff,_0_0_900px_#00d2ff]">
                Co-op Match
              </h2>
              <p className="text-3xl my-auto">Play locally with your friend!!</p>
            </div>

            <div onClick={startSearch} className=" flex flex-col flex-2 overflow-hidden bg-[#861386]/50 p-6 items-center rounded-2xl [corner-shape:bevel] border-3 border-cyan-500 hover:scale-105 transition-transform cursor-pointer text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <h2 className="text-4xl pb-3 font-bold mb-4 text-[#ffe600] [text-shadow:_0_0_5px_#ffe600,_0_0_900px_#ffe600]">
                Casual Match
              </h2>
              <p className="text-3xl my-auto">
                play with other players Online and compete for the best!!
              </p>
            </div>

          </div>
        </div>
      )}
    {/* --- STEP MODAL (MATCH TYPE) --- */}
  <Activity mode={isCoop ? "visible" : "hidden"}>
          <div
            onClick={() => setStep(1)}
            className="font-pixel fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full"
          ></div>
        </Activity>
        {isOnline && (
          <div onClick={cancelSearch} className="font-pixel fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full">
            <div onClick={(e) => e.stopPropagation()} className="text-center m-auto border-2 max-h-[40hv] font-pixel rounded-lg [corner-shape:bevel] border-cyan-400 bg-black/50 p-10 text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              {isFound && (
                <>
                  <h2 className="p-5 text-3xl text-green-800 shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                    Opponent Found!
                  </h2>
                  <p className="text-[10px] p-3">Your opponent is <strong className="text-cyan-400">{opponent.username}</strong></p>
                </>
              )}
              {!isFound && (
                <>
                  <h3 className="p-5 text-2xl">matchmaking...</h3>
                  <p className="text-[10px] p-3">looking for an opponent...</p>
                  <button
                    onClick={cancelSearch}
                    className="relative px-8 py-2  font-pixel text-white uppercase bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.7),0_0_40px_rgba(139,92,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"
                  >
                    <span className="absolute inset-1 rounded-lg border-2 border-blue-400/50 blur-[2px] shadow-[inset_0_0_10px_rgba(59,130,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"></span>
                    <span className="absolute inset-2 rounded-lg border-2 border-purple-400/50 blur-[1px] shadow-[inset_0_0_15px_rgba(139,92,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"></span>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

    {/* --- ADD FRIEND MODAL --- */}
    {addFriend && (
      <div onClick={() => setaddFriend(false)} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md border-2 border-cyan-500 rounded-lg bg-black/90 p-6">
          <h1 className="text-cyan-400 text-2xl sm:text-4xl mb-6 font-pixel">ADD FRIENDS</h1>
          <div className="flex flex-col gap-4">
            <input 
              className="border-2 border-cyan-500 rounded p-2 bg-transparent text-white" 
              value={friendName} 
              onChange={(e) => setFriendName(e.target.value)} 
              type="text" 
              placeholder="Username..." 
            />
            <button onClick={handleAddFriend} className="border-2 border-cyan-500 p-2 text-cyan-500 hover:bg-cyan-500 hover:text-black font-pixel">
              + ADD
            </button>
            {notFound && <p className="text-red-500 text-xs">Player not found</p>}
            {yourself && <p className="text-red-500 text-xs">dont add yourself</p>}
            {already && <p className="text-red-500 text-xs">already sent</p>}
            {alrFriends && <p className="text-red-500 text-xs">already friends</p>}
          </div>
        </div>
      </div>
    )}
  </>
);
}