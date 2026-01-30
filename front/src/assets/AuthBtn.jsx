import React from "react";

function AuthBtn(props) {

	const handlegoogleAuth = async (props) => {
		if (props.provider === "google")
		{
			window.location.href = '/api/auth/google/login';
		}
		if (props.provider === "42")
		{
			window.location.href = '/api/auth/42/login';
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