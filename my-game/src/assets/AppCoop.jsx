import { useEffect } from 'react';

export default function AppCoop() {
	useEffect(() => {
		window.location.href = 'https://localhost/ping-solo/';
	}, []);

	return null;
}
