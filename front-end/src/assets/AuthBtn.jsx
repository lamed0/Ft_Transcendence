import React from "react";

function AuthBtn(props) {

	const handlegoogleAuth = async (props) => {
		if (props.provider === "google")
		{
			const response = await fetch('/api/auth/google', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
		if (props.provider === "42")
		{
			const response = await fetch('/api/auth/42', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	}


	return (
		<button type="button" onClick={() => handlegoogleAuth(props)} className="flex items-center justify-center hover:opacity-50 transition-opacity">
			{props.children}
		</button>
	);
}

AuthBtn.defaultProps = {
	provider: "google",
};

export default AuthBtn;