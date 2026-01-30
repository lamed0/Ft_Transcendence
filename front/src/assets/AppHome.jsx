import { useEffect } from "react";
import react, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AppHome() {
	const navigate = useNavigate();
	const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
	
	const [step, setStep] = useState(1);
	const [user, setUser] = react.useState({
											status: 'MATCHED',
											sessionId: 'abc123',
											players: [10, 42]
											});
	const [isCoop, setIsCoop] = react.useState(false);
	const [isOnline, setIsOnline] = react.useState(false);
	const [isFound, setIsFound] = react.useState(false);
	const [opponent, setOpponent] = react.useState(null);
	useEffect(() => {
		const response = async () => {
			const res = await fetch('/api/user', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'token': ` Bearer ${localStorage.getItem('token')}`
			}
			});
			if (response.ok) {
				const data = await res.json();
				setUser(data);
				console.log("data arrived!",data);
			}else {
				console.log("no data");
			}
		}
	}, []);
	const handleStep = () => {
		setStep(2);
	}

	const handleCoop = () => {
		setIsCoop(true);
		setStep(3);
	}
	const handleOnline = async () => {
		setIsOnline(true);
		setStep(4);
		const response = await fetch('/game/matchmaking/join', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'token': ` Bearer ${localStorage.getItem('token')}`
			}
		});
		const data = await response.json();
		setOpponent(u => data);
		console.log("matchmaking response:", opponent);
		console.log("user state before matchmaking:", opponent.status);
		if (opponent.status === 'MATCHED') {
			setIsFound(true);
			await sleep(2000);
			navigate('/CasualGameLobby');
		}

	}


	return (
	<>

			<div className="flex flex-col bg-gradient-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen  text-white">
				<div className="flex flex-col min-h-screen">
					<div className="bg-black/50 max-w-[100vw] overflow-x-auto overflow-y-hidden"> 
						<div className="min-w-max w-full">
							<nav className="flex  w-[75%] m-auto justify-around backdrop-blur-md relative z-20">
								<div className="flex items-center  relative">
									<svg className="absolute -left-12 -bottom-1 bg-black border-2 mt-2" width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fillRule="evenodd" clipRule="evenodd" d="M24.0001 8C19.5818 8 16.0001 11.5817 16.0001 16C16.0001 20.4183 19.5818 24 24.0001 24C28.4183 24 32.0001 20.4183 32.0001 16C32.0001 11.5817 28.4183 8 24.0001 8ZM31.282 25.5388C34.15 23.346 36.0001 19.889 36.0001 16C36.0001 9.37258 30.6275 4 24.0001 4C17.3726 4 12.0001 9.37258 12.0001 16C12.0001 19.889 13.8501 23.346 16.7181 25.5388C14.7071 26.4283 12.8571 27.6871 11.2721 29.2721C10.0483 30.4959 9.01875 31.878 8.20361 33.3702C6.69937 36.1238 7.31283 38.9314 9.00685 40.9168C10.6377 42.828 13.2501 44 16.0001 44H32.0001C34.75 44 37.3625 42.828 38.9933 40.9168C40.6873 38.9314 41.3008 36.1238 39.7965 33.3702C38.9814 31.878 37.9518 30.4959 36.728 29.2721C35.1431 27.6872 33.293 26.4283 31.282 25.5388ZM24.0001 28C20.287 28 16.7261 29.475 14.1006 32.1005C13.1486 33.0525 12.3479 34.1273 11.714 35.2879C11.1 36.4117 11.2981 37.4396 12.0497 38.3204C12.8645 39.2753 14.3317 40 16.0001 40H32.0001C33.6684 40 35.1357 39.2753 35.9505 38.3204C36.702 37.4396 36.9001 36.4117 36.2862 35.2879C35.6522 34.1274 34.8516 33.0525 33.8996 32.1005C31.274 29.475 27.7131 28 24.0001 28Z" fill="white"/>
									</svg>
									<div className="border-2 rounded-lg mt-3 flex justify-between gap-10 p-2 max-w-125 [corner-shape:bevel] border-blue-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
										<span className="font-pixel ml-2  ">sKouma</span>
										<span className="font-pixel text-[10px] pt-[7px]">20LVL</span>
									</div> 
								</div>
								<div className="md:hidden">
									<label htmlFor="nav-menu" className="sr-only">Select a page</label>
									<select id="nav-menu" name="nav-menu" className="block w-full rounded-md border-gray-700 bg-gray-900 text-white py-2 px-3 focus:border-blue-500 focus:ring-blue-500">
									<option>Home</option>
									<option>Stats</option>
									<option>Inventory</option>
									<option>Settings</option>
									</select>
								</div>
								<ul className="hidden md:flex">
									<li className="nav-item"><a className="text-cyan-400 block p-[17px] bg-gradient-to-b to-[#4ae6d9]/50 to-100% [text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">home</a></li>
									<li className="nav-item"><Link to="/Friends" className="text-gray-600 block p-[17px] hover:text-cyan-400 hover:bg-gradient-to-b to-[#4ae6d9]/50 to-100% hover:[text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">friends</Link></li>
									<li className="nav-item"><a className="text-gray-600 block p-[17px] hover:text-cyan-400 hover:bg-gradient-to-b to-[#4ae6d9]/50 to-100% hover:[text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">stats</a></li>
									<li className="nav-item"><a className="text-gray-600 block p-[17px] hover:text-cyan-400 hover:bg-gradient-to-b to-[#4ae6d9]/50 to-100% hover:[text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">options</a></li>
								</ul>
							</nav> 
							<div className="relative w-full h-2 z-10">
								<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-md opacity-90"></div>   
								<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-[2px]"></div>          
								<div className="relative h-[2px] w-full bg-linear-to-r from-purple-400 via-cyan-400 to-purple-400"></div>
							</div>
						</div>
					</div>
					<div className="flex-1 mx-auto max-w-[1200px] w-full px-4 overflow-hidden min-w-[500px] ">
						<div className="my-2 h-[35vh]">
									<div style={{ backgroundImage: "url('../../public/unnamed.jpg')" }}  className="relative flex justify-center items-end w-full h-full bg-cover bg-center bg-no-repeat [corner-shape:bevel] border-2 border-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]">
											<button onClick={handleStep} className="absolute bottom-0 translate-y-1/2 z-10 px-16 py-4 text-2xl font-pixel text-white uppercase tracking-widest bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.7),0_0_40px_rgba(139,92,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]">
												<span className="absolute inset-1 rounded-lg border-2 border-blue-400/50 blur-[2px] shadow-[inset_0_0_10px_rgba(59,130,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"></span>
												<span className="absolute inset-2 rounded-lg border-2 border-purple-400/50 blur-[1px] shadow-[inset_0_0_15px_rgba(139,92,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"></span>
												Start Game
											</button>
									</div>
						</div>
						<div className="flex mt-15 justify-around">
							<div className="max-w-75 bg-black/40 overflow-hidden mr-auto flex-1 h-[35vh] mx-2  bg-cover bg-center bg-no-repeat [corner-shape:bevel] border-2 border-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]">
								<ul className="">
									<li className="rounded-3 bg-purple-900/50 p-4 font-pixel text-2xl text-cyan-400 [text-shadow:_0_0_5px_#00d2ff,_0_0_900px_#00d2ff]">FRIENDS</li>
									<div className="relative w-full h-2">
										<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-md opacity-90"></div>   
										<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-[2px]"></div>          
										<div className="relative h-[2px] w-full bg-linear-to-r via-cyan-400"></div>
									</div>
									<li className='flex items-center p-2  gap-6 group'>
										<div className='relative'>
											<img className='border [corner-shape:bevel] rounded-[10%]' src="../public/unnamed.png" alt="" />
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black border border-black ">
											</div>
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00ff41] border border-black 
												shadow-[0_0_8px_#00ff41,0_0_15px_#00ff41] animate-pulse">
											</div>
										</div>
										<span className='text-xl font-pixel'>sKouma</span>
									</li>
									<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
									<li className='flex items-center p-2 gap-6 group'>
										<div className='relative'>
											<img className='border [corner-shape:bevel] rounded-[10%]' src="../public/unnamed.png" alt="" />
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black border border-black ">
											</div>
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ff0000] border border-black 
												shadow-[0_0_8px_#ff0000,0_0_15px_#ff0000] animate-pulse">
											</div>
										</div>
										<span className='text-xl font-pixel'>sKouma</span>
									</li>
									<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
									<li className='flex items-center p-2  gap-6 group'>
										<div className='relative'>
											<img className='border [corner-shape:bevel] rounded-[10%]' src="../public/unnamed.png" alt="" />
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black border border-black ">
											</div>
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ff5e00] border border-black 
												shadow-[0_0_8px_#ff5e00,0_0_15px_#ff5e00] animate-pulse">
											</div>
										</div>
										<span className='text-xl font-pixel'>sKouma</span>
									</li>
									<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
								</ul>
							</div>
							<div className="max-w-[300px] bg-black/40 ml-auto flex-1 h-[35vh] mx-2  bg-cover bg-center bg-no-repeat [corner-shape:bevel] border-2 border-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]">
								<ul>
									<li className="rounded-3 bg-purple-900/50 p-4 font-pixel text-2xl text-cyan-400 [text-shadow:_0_0_5px_#00d2ff,_0_0_900px_#00d2ff]">HISTORY</li>
									<div className="relative w-full h-2">
										<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-md opacity-90"></div>   
										<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-[2px]"></div>          
										<div className="relative h-[2px] w-full bg-linear-to-r via-cyan-400"></div>
									</div>
									<li className='flex items-center p-3  gap-6 group'>
										<span className='text-[12px] font-pixel'>player A | 25-7 | <span className='text-red-500'>LOSS</span></span>
									</li>
									<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
									<li className='flex items-center p-3  gap-6 group'>
										<span className='text-[12px] font-pixel'>player B | 22-25 | <span className='text-green-500'>WIN</span></span>
									</li>
									<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
									<li className='flex items-center p-3  gap-6 group'>
										<span className='text-[12px] font-pixel'>player C | 15-25 | <span className='text-green-500'>WIN</span></span>
									</li>
									<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
								</ul>
							</div>
						</div>
					</div>
					<footer className="sticky bottom-0 mt-auto overflow-x-auto bg-[#2b052b] max-w-[100vw] overflow-y-hidden"> 
						<div className="min-w-max w-full">
							<div className="relative w-full h-2">
								<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-md opacity-90"></div>   
								<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-[2px]"></div>          
								<div className="relative h-[2px] w-full bg-linear-to-r from-purple-400 via-cyan-400 to-purple-400"></div>
							</div>
							<nav className="flex  max-w-[75%] m-auto justify-between my-3 min-w-[600px]">
								<ul className="">
									<li className="nav-item"><a href="" className="text-transparent [-webkit-text-stroke:1px_#00FFFF]">support</a></li>
									<li className="nav-item"><a href="" className="text-transparent [-webkit-text-stroke:1px_#00FFFF]">about</a></li>
								</ul>
								<ul className="flex justify-between gap-5">
								<li>
									<form>
										<button className="flex items-center justify-center hover:opacity-50 transition-opacity">
											<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path fillRule="evenodd" clipRule="evenodd" d="M24.0199 0C10.7375 0 0 10.8167 0 24.1983C0 34.895 6.87988 43.9495 16.4241 47.1542C17.6174 47.3951 18.0545 46.6335 18.0545 45.9929C18.0545 45.4319 18.0151 43.509 18.0151 41.5055C11.3334 42.948 9.94198 38.6209 9.94198 38.6209C8.86818 35.8164 7.27715 35.0956 7.27715 35.0956C5.09022 33.6132 7.43645 33.6132 7.43645 33.6132C9.86233 33.7735 11.1353 36.0971 11.1353 36.0971C13.2824 39.7827 16.7422 38.7413 18.1341 38.1002C18.3328 36.5377 18.9695 35.456 19.6455 34.8552C14.3163 34.2942 8.70937 32.211 8.70937 22.9161C8.70937 20.2719 9.66321 18.1086 11.1746 16.4261C10.9361 15.8253 10.1008 13.3409 11.4135 10.0157C11.4135 10.0157 13.4417 9.3746 18.0146 12.4996C19.9725 11.9699 21.9916 11.7005 24.0199 11.6982C26.048 11.6982 28.1154 11.979 30.0246 12.4996C34.5981 9.3746 36.6262 10.0157 36.6262 10.0157C37.9389 13.3409 37.1031 15.8253 36.8646 16.4261C38.4158 18.1086 39.3303 20.2719 39.3303 22.9161C39.3303 32.211 33.7234 34.2539 28.3544 34.8552C29.2296 35.6163 29.9848 37.0583 29.9848 39.3421C29.9848 42.5871 29.9454 45.1915 29.9454 45.9924C29.9454 46.6335 30.383 47.3951 31.5758 47.1547C41.12 43.9491 47.9999 34.895 47.9999 24.1983C48.0392 10.8167 37.2624 0 24.0199 0Z" fill="white"/>
											</svg>
										</button>
									</form>
								</li>
								<li>
									<form>
										<button className="flex items-center justify-center hover:opacity-50 transition-opacity">
											<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path fillRule="evenodd" clipRule="evenodd" d="M24.0199 0C10.7375 0 0 10.8167 0 24.1983C0 34.895 6.87988 43.9495 16.4241 47.1542C17.6174 47.3951 18.0545 46.6335 18.0545 45.9929C18.0545 45.4319 18.0151 43.509 18.0151 41.5055C11.3334 42.948 9.94198 38.6209 9.94198 38.6209C8.86818 35.8164 7.27715 35.0956 7.27715 35.0956C5.09022 33.6132 7.43645 33.6132 7.43645 33.6132C9.86233 33.7735 11.1353 36.0971 11.1353 36.0971C13.2824 39.7827 16.7422 38.7413 18.1341 38.1002C18.3328 36.5377 18.9695 35.456 19.6455 34.8552C14.3163 34.2942 8.70937 32.211 8.70937 22.9161C8.70937 20.2719 9.66321 18.1086 11.1746 16.4261C10.9361 15.8253 10.1008 13.3409 11.4135 10.0157C11.4135 10.0157 13.4417 9.3746 18.0146 12.4996C19.9725 11.9699 21.9916 11.7005 24.0199 11.6982C26.048 11.6982 28.1154 11.979 30.0246 12.4996C34.5981 9.3746 36.6262 10.0157 36.6262 10.0157C37.9389 13.3409 37.1031 15.8253 36.8646 16.4261C38.4158 18.1086 39.3303 20.2719 39.3303 22.9161C39.3303 32.211 33.7234 34.2539 28.3544 34.8552C29.2296 35.6163 29.9848 37.0583 29.9848 39.3421C29.9848 42.5871 29.9454 45.1915 29.9454 45.9924C29.9454 46.6335 30.383 47.3951 31.5758 47.1547C41.12 43.9491 47.9999 34.895 47.9999 24.1983C48.0392 10.8167 37.2624 0 24.0199 0Z" fill="white"/>
											</svg>
										</button>
									</form>      
								</li>
					
								</ul>
						
							</nav> 
						</div>
					</footer>
				</div>

			</div>
		{step === 2 && (
			<div onClick={() => setStep(1)} className="font-pixel text-center fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full">

				<div onClick={(e) => e.stopPropagation()} className="h-[50vh] flex flex-2 gap-8 p-10 max-w-6xl w-full overflow-y-auto">

					<div onClick={handleCoop} className=" flex flex-col flex-2 bg-[#861386]/50 p-6 items-center rounded-2xl [corner-shape:bevel] border-3 border-cyan-500 hover:scale-105 transition-transform cursor-pointer text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
						<h2 className="text-4xl pb-5 font-bold mb-4 text-cyan-500 [text-shadow:_0_0_5px_#00d2ff,_0_0_900px_#00d2ff]">Co-op Match</h2>
						<p>Play in your local pc woth your friend!!</p>
					</div>

					<div onClick={handleOnline} className=" flex flex-col flex-2 bg-[#861386]/50 p-6 items-center rounded-2xl [corner-shape:bevel] border-3 border-cyan-500 hover:scale-105 transition-transform cursor-pointer text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
						<h2 className="text-4xl pb-3 font-bold mb-4 text-[#ffe600] [text-shadow:_0_0_5px_#ffe600,_0_0_900px_#ffe600]">Casual Match</h2>
						<p>enter a private room with your friend and play head to head online.</p>
						<button>Play Online!</button>
					</div>

					<div className=" flex flex-col flex-2 bg-[#861386]/50 p-6 items-center rounded-2xl [corner-shape:bevel] border-3 border-cyan-500 hover:scale-105 transition-transform cursor-pointer text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
						<h2 className="text-3xl pb-5 font-bold mb-4 text-[#af3bfc] [text-shadow:_0_0_5px_#af3bfc,_0_0_900px_#af3bfc]">Tournament</h2>
						<p>arrange or join a tournament to decide who is the strongest among you</p>
						<button>Play in a Tournament!</button>
					</div>
				</div>
				
			</div>
		)
		}
		{isCoop && (
				<div onClick={() => setStep(1)} class="font-pixel fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full">
					
				</div>
			)
		}
		{isOnline && (
				<div onClick={() => (setIsOnline(false))} className="font-pixel fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full">
					<div onClick={(e) => e.stopPropagation()} className="text-center m-auto border-2 max-h-[40hv] font-pixel rounded-lg [corner-shape:bevel] border-cyan-400 bg-black/50 p-10 text-white shadow-[0_0_20px_rgba(0,255,255,0.3)]">
						{isFound && (
							<>
								<h2 className="p-5 text-3xl text-green-800 shadow-[0_0_10px_rgba(0,255,0,0.5)]">Opponent Found!</h2>
								<p className="text-[10px] p-3">Your opponent is sKouma</p>
							</>
						)}
						{!isFound &&(
							<>
								<h3 className="p-5 text-2xl">matchmaking...</h3>
								<p className="text-[10px] p-3">looking for an opponent...</p>
								<button onClick={() => (setIsOnline(false))}  className="relative px-8 py-2  font-pixel text-white uppercase bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.7),0_0_40px_rgba(139,92,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]">
									<span className="absolute inset-1 rounded-lg border-2 border-blue-400/50 blur-[2px] shadow-[inset_0_0_10px_rgba(59,130,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"></span>
									<span className="absolute inset-2 rounded-lg border-2 border-purple-400/50 blur-[1px] shadow-[inset_0_0_15px_rgba(139,92,246,0.5)] [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"></span>
									Cancel
								</button>
							</>
						)}
					</div>	
				</div>
			)
		}
	</>
	);
}