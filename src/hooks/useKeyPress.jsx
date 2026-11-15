import { useEffect, useState } from "react";

function useKeyPress(
	targetKey,
	callback = null,
	preventDefault = false,
	activated = true,
) {
	const [keyPressed, setKeyPressed] = useState(false);

	useEffect(() => {
		const downHandler = (e) => {
			if (e.key === targetKey && activated && !e.repeat) {
				if (preventDefault) {
					e.preventDefault();
					e.stopPropagation();
				}
				setKeyPressed(true);
				if (callback) callback();
			}
		};
		const upHandler = (e) => {
			if (e.key === targetKey && activated) {
				setKeyPressed(false);
			}
		};

		window.addEventListener("keydown", downHandler);
		window.addEventListener("keyup", upHandler);

		return () => {
			window.removeEventListener("keydown", downHandler);
			window.removeEventListener("keyup", upHandler);
		};
	}, [targetKey, callback, preventDefault, activated]);

	return keyPressed;
}

export default useKeyPress;
