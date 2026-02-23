import { Activity, useEffect } from "react";
import React, { useState, useRef } from "react";

export default function RenderFriends(props) {
	const [isDelete, setIsDelete] = useState(false);
	const [isDeluser, setIsDeluser] = useState("");

    const handleRemove = async (id) => {
		const res = await fetch(`/api/friends/request/${id}`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		});
		if (res.ok)
			setIsDelete(false);
    };
	
	const handledelete = (id) => {
		setIsDeluser(id);
		setIsDelete(true);
	}
	console.log(props.friends)
    return (
		<>
			<ul className="flex flex-col w-full">
				{(props.friends || []).map((friend) => (
					<React.Fragment key={friend.id}>
						<li className="group flex items-center justify-between p-3 transition-all hover:bg-white/5">
							<div className="flex items-center gap-4">
								{/* Avatar with Status Dot */}
								{/* <div className="relative">
									<div className="w-10 h-10 bg-green-500 rounded-sm border border-white flex items-center justify-center text-white font-pixel text-xs">
										{friend.username[0]}
									</div>
									</div> */}
									<div className="relative ">
										{!friend.avatarUrl && (
										<svg className="rounded-sm border bg-black border-white" width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path fillRule="evenodd" clipRule="evenodd" d="M24.0001 8C19.5818 8 16.0001 11.5817 16.0001 16C16.0001 20.4183 19.5818 24 24.0001 24C28.4183 24 32.0001 20.4183 32.0001 16C32.0001 11.5817 28.4183 8 24.0001 8ZM31.282 25.5388C34.15 23.346 36.0001 19.889 36.0001 16C36.0001 9.37258 30.6275 4 24.0001 4C17.3726 4 12.0001 9.37258 12.0001 16C12.0001 19.889 13.8501 23.346 16.7181 25.5388C14.7071 26.4283 12.8571 27.6871 11.2721 29.2721C10.0483 30.4959 9.01875 31.878 8.20361 33.3702C6.69937 36.1238 7.31283 38.9314 9.00685 40.9168C10.6377 42.828 13.2501 44 16.0001 44H32.0001C34.75 44 37.3625 42.828 38.9933 40.9168C40.6873 38.9314 41.3008 36.1238 39.7965 33.3702C38.9814 31.878 37.9518 30.4959 36.728 29.2721C35.1431 27.6872 33.293 26.4283 31.282 25.5388ZM24.0001 28C20.287 28 16.7261 29.475 14.1006 32.1005C13.1486 33.0525 12.3479 34.1273 11.714 35.2879C11.1 36.4117 11.2981 37.4396 12.0497 38.3204C12.8645 39.2753 14.3317 40 16.0001 40H32.0001C33.6684 40 35.1357 39.2753 35.9505 38.3204C36.702 37.4396 36.9001 36.4117 36.2862 35.2879C35.6522 34.1274 34.8516 33.0525 33.8996 32.1005C31.274 29.475 27.7131 28 24.0001 28Z" fill="white"/>
										</svg>
										)}
										{friend.avatarUrl && (
											<img src={friend.avatarUrl} className="w-10 h-10 object-cover" alt="" />
										)}
										<div className={`absolute -bottom-1 -right-1 w-2 h-2 ${friend.status === 'ONLINE' ? 'bg-[#00ff41] shadow-[0_0_5px_#00ff41]' : friend.status === 'OFFLINE' ? 'bg-[#ff0000] shadow-[0_0_5px_#ff0000]' : 'bg-[#ffaa00] shadow-[0_0_5px_#ffaa00]'} border border-black `} />
									</div>
								{/* Username */}
								<span className="text-white font-pixel text-sm tracking-tighter">
									{friend.username}
								</span>
							</div>

							{/* Remove Button: Visible only on Hover */}
							<button 
								onClick={() => handledelete(friend.id)}
								className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 
										text-[10px] font-pixel text-gray-500 hover:text-[#ff0000] hover:[text-shadow:0_0_8px_#ff0000]"
							>
								[ X ]
							</button>
						</li>
						{/* Your existing divider */}
						<div className='h-[1px] bg-linear-to-l via-white/10 w-full' />
						{isDelete && (
							<div onClick={() => setIsDelete(false)}  className="font-pixel text-center fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md h-full w-full">
								<div onClick={(e) => e.stopPropagation()} className="min-w-[35%] border-2 border-cyan-500 rounded-[5px] [corner-shape:bevel] items-center bg-black/50">
								<h1 className="text-cyan-400 [text-shadow:0_0_5px_#00d2ff,0_0_900px_#00d2ff] text-4xl p-5  shadow-[inset_0_0_15px_rgba(139,92,246,0.5)]">REMOVE FRIEND</h1>
								<p className="p-3">are you sure you wanna remove <strong className="text-cyan-400">{props.friends[0].username}</strong>?</p>
								<button className="my-5 px-6 py-2 bg-transparent border-2 border-[#00f2ff] text-[#00f2ff] font-pixel text-xs uppercase tracking-tighter transition-all duration-300 hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_15px_#00f2ff] active:scale-95 [corner-shape:bevel] rounded-[4px]" 
										onClick={() => handleRemove(isDeluser)}>
									remove
								</button>
								</div>
							</div>
						)}
					</React.Fragment>
				))}
			</ul>
        </>
    );
}
// export default function RenderHistory(props) {
// 	const friends = (props.friends || []).map((friend) => (
// 		<>
// 			<li key={friend.id ?? friend.username} className="flex items-center p-2 gap-6 group">
// 				<div className="relative">
// 				<img className="border [corner-shape:bevel] rounded-[10%]" src="/unnamed.png" alt="" />
// 				<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black border border-black" />
// 				<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00ff41] border border-black shadow-[0_0_8px_#00ff41,0_0_15px_#00ff41] animate-pulse" />
// 				</div>
// 				<span className="text-xl font-pixel">{friend.username}</span>
// 			</li>
// 			<div className='h-[2px] bg-linear-to-l via-black/50  w-full'></div>
// 		</>
// 	));

// 	return friends;
// }


