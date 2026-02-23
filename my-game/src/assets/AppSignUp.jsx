import React, {use, useState} from "react";
import { useEffect } from "react";
import Button from "./AuthBtn.jsx";
import { Link, useNavigate } from "react-router-dom";


export default function AppSignUp() {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1);
	const [userName, setUsername] = useState("");
	const [isResendable, setIsResendable] = useState(true);
	const [countDown, setCountDown] = useState(0);
	const [isEmailTaken, setIsEmailTaken] = useState(false);
	const [isUserNameTaken, setUserNameTaken] = useState(false);
	const [isUserNameInvalid, setUserNameInvalid] = useState(false);
	const [isEmailInvalid, setIsEmailInvalid] = useState(false);
	const [shortPassword, setShortPassword] = useState(false);
	const [complexityPassword, setComplexityPassword] = useState(false);
	const [passwordMismatch, setPasswordMismatch] = useState(false);

	useEffect(() => {
	let countdownInterval;
	if (countDown > 0) {
		countdownInterval = setInterval(() => {
			setCountDown((prevCount) => { 
				prevCount - 1;
			});
			}, 1000);
	}else if (countDown === 0) {
		setIsResendable(true);
		clearInterval(countdownInterval);
	}
	}, [countDown]);

	const checkEmail = async (email) => {
		    console.log("Username entered:", email);
			const emailPattern = /^(?![^@]*[.@]{2,})[^\s@]+@[^\s@]+\.[a-z0-9]{1,}$/i;

			const isValid = emailPattern.test(email); 
			if (isValid) {
				const res = await fetch("api/auth/check-exists", {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({email : email}),
				});
				const data = await res.json();
				console.log(data.exists)
				if (res.ok && data.exists == false)
					setStep(2);
				else{
					setIsEmailTaken(true);
				}
			} else 
				setIsEmailInvalid(true);
	};

	const checkP = (password, cpassword) => {
		// 1. Must be a string
		if (typeof password !== "string") {
			console.error("Password must be a string");
			return;
		}

		// 2. Must be at least 6 characters
		if (password.length < 6) {
			setShortPassword(true);
			return;
		}

		// 3. Complexity: Lowercase, Uppercase, and Number
		// Logic: (?=.*[a-z]) checks for lowercase, (?=.*[A-Z]) for uppercase, (?=.*\d) for number
		const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
		if (!complexityRegex.test(password)) {
			setComplexityPassword(true);
			return;
		}

		// 4. Match check
		if (password !== cpassword) {
			setPasswordMismatch(true);
			return;
		}

		// If all checks pass:
		setStep(3);
	};

	const checkUsername =  async (username) => {
		console.log("Username entered:", username);
		if (username.length < 3 || username.length > 20) {
			setUserNameInvalid(true);
		}
		else {
			const formData = {
				email: email,           // from step 1
				password: password,     // from step 2
				username: userName          // from step 3
			};
			const res = await fetch("api/auth/check-exists", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({username : username}),
			});
			const data = await res.json();
			if (res.ok && data.exists === false){
				setStep(4);
				try {
					// 2. Send it to your backend URL
					const response = await fetch('/api/auth/register', {
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(formData), // Turn the object into a string
					});
					const data = await response.json();
					if (response.ok) {
						console.log("Backend received the data!");
					} else {
						console.error("Backend rejected the data.");
					}
				} catch (error) {
					console.error("The 'delivery truck' crashed:", error);
				}
			}
			else {
				setUserNameTaken(true);
			}

		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form Submitted!", { email, password, userName });
		alert("Signup Successful!");
	};

	const handleResend = async () => {
		const formData = {
				email: email         
			};

			try {
				// 2. Send it to your backend URL
				const response = await fetch('/api/auth/resend-verification', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData), // Turn the object into a string
				});
				const data = await response.json();
				if (response.ok) {
					console.log("Backend received the data!");
					// navigate('/Home');
				} else {
					console.error("Backend rejected the data.");
				}
			} catch (error) {
				console.error("The 'delivery truck' crashed:", error);
			}
	}

	const resendEmail = () => {

		if (!isResendable) {
			return;
		}
		setIsResendable(prev => false);
		setCountDown(60);
		console.log("Resending verification email to:", email);
		handleResend();
	};
	return (
		<div className=" h-screen bg-gradient-to-t from-[#861386] to-[#170D26] text-center to-60% min-h-screen flex items-center justify-center text-white">
			<div className=" max-h-[80vh] overflow-y-auto bg-black/50 border-2 border-[#00FFFF] rounded-[40px] p-10 " >
				<h1 className="font-pixel text-transparent [-webkit-text-stroke:3px_#00FFFF] text-[50px] uppercase ">Sign up</h1>
				<form>
					{/* entering email */}
					{step === 1 && (
						<>
							<div id="step1" className="mt-15 mb-15">
								<label htmlFor="email" className="p-2 font-pixel  text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Email</label><br/>
								<input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your Email..." className="text-[20px] font-pixel bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/>
								{isEmailTaken && (
										<p onClick={() => setIsEmailInvalid(false)} className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">This email is already taken.</p>
								)}
								{isEmailInvalid && (
										<p onClick={() => setIsEmailTaken(false)} className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">This email is invalid.</p>
								)}
							</div>
							<button id="continueButton" type="button" onClick={() => checkEmail(email)} className="mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-['Press_Start_2P'] text-2xl tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]">Continue</button>
						</>
					)}
					{step === 4 && (
							<div id="step3" className="mt-10">
								<h3 className="font-pixel text-[20px] uppercase pb-5">verify your email</h3>
								<p className="font-pixel pb-2">note: we sent a verification email to your inbox, please check your inbox.</p>
								<p className="font-pixel pb-2">
									didn't receive it? 
									<button onClick={resendEmail} type="button">
										{isResendable && (
											<p className="text-cyan-400 pl-2"> resend</p>
										)}
										{!isResendable && (
											<p className="text-gray-500 pl-2"> resend</p>
										)}
									</button>
								</p>
							</div>
					)}
					{step === 2  && (
						<>
							<div id="step2" className="mt-5 ">
								<label htmlFor="password" className="font-pixel text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Password</label><br/>
								<input type="text" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password..."  className="text-[20px] font-pixel bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/><br/><br/>
								<input type="password" id="checkPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password..."  className="mt-5 text-[20px] font-pixel bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/><br/><br/>
							</div>
							{shortPassword && (
								<>
									<p onClick={() => {setComplexityPassword(false)
									                    setPasswordMismatch(false)
                                    }}
                                     className="text-red-500 font-pixel text-[12px] m-2 overflow-auto">Password must be longer than or equal to 6 characters.</p>
								</>
							)}
							{complexityPassword && (
								<>
									<div onClick={() => {setShortPassword(false);
									                    setPasswordMismatch(false);
                                    }}  className="text-red-500 font-pixel text-[12px] m-2 overflow-auto">
										<p>at least one lowercase letter,</p>
										<p>one uppercase letter,</p>
										<p>and one number.</p>
									</div>
								</>
							)}
							{passwordMismatch && (
								<>
									<p onClick={() => {setShortPassword(false);
									                    setComplexityPassword(false);
                                    }} className="text-red-500 font-pixel text-[12px] m-2 overflow-auto">Passwords do not match.</p>
									
								</>
							)}
							<button id="submitButton" type="button" onClick={() => checkP(password, confirmPassword)} className=" mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-['Press_Start_2P'] text-2xl tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]">Continue</button>
						</>
					)}
					{/* entering username */}
					{step === 3 && (
						<>
							<div className="my-5">
								<label htmlFor="username" className="p-2 font-pixel  text-[30px]  text-transparent [-webkit-text-stroke:2px_#00FFFF]">Username</label><br/>
								<input type="text" id="username" name="username" value={userName} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your Username..." className="text-[20px] font-pixel bg-black border-2 border-[#00FFFF] rounded-[40px] p-2 w-full"/>
								{isUserNameTaken && (
									<>
									<p onClick={() => setUserNameInvalid(false)} className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">This Username is already taken.</p>
									
									</>
								)}
								{isUserNameInvalid && (
									<>
										<p onClick={() => setUserNameTaken(false)} className="text-red-500 font-pixel text-[12px] mt-2 overflow-auto">This Username is invalid.</p>
										
									</>
								)}
							</div>
							<button id="usernameButton" type="button" onClick={() => checkUsername(userName)} className=" mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-['Press_Start_2P'] text-2xl tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]">Finish</button>
							{/* <input action="" type="submit" value="Login" class="mt-[80] p-2 bg-[#FF00E5] text-white px-8 py-4 rounded-full font-['Press_Start_2P'] text-2xl uppercase tracking-widest border-b-8 border-r-8 border-[#B500A2] active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 shadow-[0_0_20px_rgba(255,0,229,0.5)] hover:shadow-[0_0_35px_rgba(255,0,229,0.8)]"/> */}
						</>
					)

					}
				</form>
				{step === 1 && (
					<>
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
						<p className="pt-3">When you click <strong>Continue</strong> you are accepting our <Link className="text-blue-500" to="/PrivacyPolicy">Privacy policy</Link></p>
					</>
				)
				}
			</div>
		</div>
	);
}