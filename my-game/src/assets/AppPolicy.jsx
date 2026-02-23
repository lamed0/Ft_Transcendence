import { Link, useNavigate } from "react-router-dom";
import react, { useState, useRef } from "react";
import { Activity, useEffect } from "react";


export default function AppPolicy(){

	return (
		<div className=" bg-linear-to-t from-[#861386] to-[#170D26] to-50% min-h-screen  text-white">
			<div className='sticky top-0 h-[10vh] mb-auto bg-[#170D26]'>
				<div className='relative to-50% max-w-4xl h-[10vh] mx-auto'>
				</div>
			</div>
			<div className='max-w-5xl mx-auto bg-black/30 tracking-tighter'>
				<h1 className='font-tight text-4xl font-black uppercase tracking-tighter text-center text-white p-5'>Privacy Policy </h1><br/>
				<p className='p-5'>Last Updated: February 5, 2026</p>
				<h2 className='font-black text-2xl p-5'>Introduction</h2>
				<p className='p-4 font-inter'>Welcome to Transcendent Pong. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.</p><br/>
				<h2 className='font-black text-2xl p-5'>Data We Collect</h2>
				<p className='pt-4 font-inter px-5'>We collect information that you provide directly to us, as well as information generated automatically during your gameplay:</p>
				<p className=' font-inter px-6 pt-1'><strong>Account Information</strong>: Email address, username, and hashed passwords.</p>
				<p className=' font-inter px-6'><strong>Game Data</strong>: Match history, wins/losses, and ranking statistics.</p>
				<p className=' font-inter px-6'><strong>Social Data</strong>: Friends lists and messages sent through the in-game chat system.</p>
				<p className=' font-inter px-6'><strong>Technical Data</strong>: IP addresses, browser type, and device information required to maintain WebSocket connections and prevent unauthorized access.</p>
				<h2 className='font-black text-2xl p-5'>Cookies and Authentication</h2>
				<p className=' font-inter px-6 pt-1'>
					We use strictly necessary cookies to keep you logged in.<br />
					• JWT (JSON Web Tokens): We store authentication tokens in HttpOnly cookies to protect your session from Cross-Site Scripting (XSS) attacks.<br />
					• These cookies do not track your activity on other websites; they are used solely to manage your session on this platform.
				</p>
				<h2 className='font-black text-2xl p-5'>How We Use Your Data</h2>
				<p className=' font-inter px-6 pt-1'>
					Your data is used to:<br />
					• Facilitate matchmaking and real-time gameplay.<br />
					• Manage your account and provide access to the platform.<br />
					• Power the chat and friends-list features.<br />
					• Improve the performance and security of our Dockerized backend infrastructure.
				</p>
				<h2 className='font-black text-2xl p-5'>Data Retention</h2>
				<p className=' font-inter px-6 pt-1'>
					We retain your personal information for as long as your account is active. If you choose to delete your account, your personal identifiers (email/username) will be removed from our database, though anonymized game statistics may remain.
				</p>
				<h2 className='font-black text-2xl p-5'>Third-Party Services</h2>
				<p className=' font-inter px-6 pt-1'>
					We do not sell, trade, or rent your personal identification information to others. We may use third-party infrastructure providers (such as hosting and database services) to operate the application, but they are obligated to keep your information confidential.
				</p>
				<h2 className='font-black text-2xl p-5'>Security</h2>
				<p className=' font-inter px-6 pt-1'>
					We implement a variety of security measures, including Prisma-level data validation and secure token-handling, to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.
				</p>
				<h2 className='font-black text-2xl p-5'>Your Rights</h2>
				<p className=' font-inter px-6 pt-1'>
					Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, please contact the project administrators through the official repository or support channel.
				</p>
				<h2 className='font-black text-2xl p-5'>Changes to This Policy</h2>
				<p className=' font-inter px-6 py-1'>
					We reserve the right to update this policy as we add new features to the game. We will notify users of any significant changes by updating the "Last Updated" date at the top of this page.
				</p>
			</div>
		</div>
	);
}