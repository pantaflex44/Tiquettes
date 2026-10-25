import { useEffect, useState } from "react";

function useKeyPress(targetKey, callback = null, preventDefault = false) {
	const [keyPressed, setKeyPressed] = useState(false);

	useEffect(() => {
		const downHandler = (e) => {
			if (e.key === targetKey) {
				if (preventDefault) {
					e.preventDefault();
					e.stopPropagation();
				}
				setKeyPressed(true);
				if (callback) callback();
			}
		};
		const upHandler = (e) => {
			if (e.key === targetKey) {
				if (preventDefault) {
					e.preventDefault();
					e.stopPropagation();
				}
				setKeyPressed(false);
				if (callback) callback();
			}
		};

		window.addEventListener("keydown", downHandler);
		window.addEventListener("keyup", upHandler);

		return () => {
			window.removeEventListener("keydown", downHandler);
			window.removeEventListener("keyup", upHandler);
		};
	}, [targetKey]);

	return keyPressed;
}

export default useKeyPress;
