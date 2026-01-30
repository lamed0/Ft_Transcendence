import React from "react";
import { Link, Navigate } from 'react-router-dom';


export default function AppFriends() {

	return (
		<div className="grid grid-cols-[350px_1fr] grid-rows-[68px_1fr_64px] bg-gradient-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen  text-white">
			<div className="col-span-2 bg-black/50 max-w-[100vw] overflow-x-auto overflow-y-hidden"> 
				<div className="min-w-max w-full">
					<nav className="flex  w-[75%] m-auto justify-around backdrop-blur-md relative z-20">
						<div className="flex items-center  relative">
							<svg className="absolute -left-12 -bottom-1 bg-black border-2 mt-2" width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" clipRule="evenodd" d="M24.0001 8C19.5818 8 16.0001 11.5817 16.0001 16C16.0001 20.4183 19.5818 24 24.0001 24C28.4183 24 32.0001 20.4183 32.0001 16C32.0001 11.5817 28.4183 8 24.0001 8ZM31.282 25.5388C34.15 23.346 36.0001 19.889 36.0001 16C36.0001 9.37258 30.6275 4 24.0001 4C17.3726 4 12.0001 9.37258 12.0001 16C12.0001 19.889 13.8501 23.346 16.7181 25.5388C14.7071 26.4283 12.8571 27.6871 11.2721 29.2721C10.0483 30.4959 9.01875 31.878 8.20361 33.3702C6.69937 36.1238 7.31283 38.9314 9.00685 40.9168C10.6377 42.828 13.2501 44 16.0001 44H32.0001C34.75 44 37.3625 42.828 38.9933 40.9168C40.6873 38.9314 41.3008 36.1238 39.7965 33.3702C38.9814 31.878 37.9518 30.4959 36.728 29.2721C35.1431 27.6872 33.293 26.4283 31.282 25.5388ZM24.0001 28C20.287 28 16.7261 29.475 14.1006 32.1005C13.1486 33.0525 12.3479 34.1273 11.714 35.2879C11.1 36.4117 11.2981 37.4396 12.0497 38.3204C12.8645 39.2753 14.3317 40 16.0001 40H32.0001C33.6684 40 35.1357 39.2753 35.9505 38.3204C36.702 37.4396 36.9001 36.4117 36.2862 35.2879C35.6522 34.1274 34.8516 33.0525 33.8996 32.1005C31.274 29.475 27.7131 28 24.0001 28Z" fill="white"/>
							</svg>
							<div className="border-2 rounded-lg mt-3 flex justify-between gap-10 p-2 max-w-[500px] [corner-shape:bevel] border-blue-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
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
							<li className="nav-item"><Link to="/Home" className="text-gray-600 block p-[17px] hover:text-cyan-400 hover:bg-gradient-to-b hover:to-[#4ae6d9]/50 hover:to-100% hover:[text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">home</Link></li>
							<li className="nav-item"><Link to="/Friends" className="text-cyan-400 block p-[17px] bg-gradient-to-b to-[#4ae6d9]/50 to-100% [text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">friends</Link></li>
							<li className="nav-item"><Link to="" className="text-gray-600 block p-[17px] hover:text-cyan-400 hover:bg-gradient-to-b to-[#4ae6d9]/50 to-100% hover:[text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">stats</Link></li>
							<li className="nav-item"><Link to="" className="text-gray-600 block p-[17px] hover:text-cyan-400 hover:bg-gradient-to-b to-[#4ae6d9]/50 to-100% hover:[text-shadow:_0_0_5px_#00d2ff,_0_0_10px_#00d2ff,_0_0_20px_#00d2ff]">options</Link></li>
						</ul>
					</nav> 
					<div className="relative w-full h-2 z-10">
						<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-md opacity-90"></div>   
						<div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-purple-600 via-cyan-400 to-purple-600 blur-[2px]"></div>          
						<div className="relative h-[2px] w-full bg-linear-to-r from-purple-400 via-cyan-400 to-purple-400"></div>
					</div>
				</div>
			</div>{/* End of nav bar */}
			<div className="grid grid-cols-[350px_1fr] col-span-2 px-60 relative z-5 gap-2">
				<div className="col-span-1 flex-1 bg-[#2b052b]  border-pink-500 border-r-0">
					<input id="search"  className=" bg-[#2b052b] border-cyan-400 m-1 border-3 font-pixel w-[80%] mt-6 h-[50px] [corner-shape:bevel] rounded-[5%] shadow-[0_0_20px_rgba(0,255,255,0.3)]" placeholder="search a friend..." type="text" />
					<ul>
						<li></li>
					</ul>
				</div>
				<div className="col-span-1 flex-4 bg-[#041a20]  border-cyan-500"></div>
			</div>
			<footer className="col-span-2 sticky bottom-0 mt-auto overflow-x-auto bg-[#2b052b] max-w-[100vw] overflow-y-hidden"> 
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
	);

}