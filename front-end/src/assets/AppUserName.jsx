export default function AppUserName() {
	return (
		    <div class=" max-h-[80vh] overflow-y-auto bg-black/50 border-2 border-[#00FFFF] rounded-[40px] p-10 " >
				<h1 class="font-pixel text-transparent [-webkit-text-stroke:3px_#00FFFF] text-[50px] uppercase ">Login</h1>
				<form action="home.html">
					<div class="my-5">
						<label for="username" class="p-2 font-pixel  text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Username</label><br/>
						<input type="text" id="username" name="username" placeholder="Enter your Username..." class="text-[20px] font-pixel bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/>
					</div>
					<input action="" type="submit" value="Login" class="mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-['Press_Start_2P'] text-2xl uppercase tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]"/>
				</form>
   			 </div>
	);
}