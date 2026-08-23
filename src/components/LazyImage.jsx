/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2026 Christophe LEMOINE

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useCallback, useEffect, useRef, useState } from "react";

function LazyImage({
	src,
	width = null,
	height = null,
	alt = "",
	root = null,
	rootMargin = "0px",
	threshold = 0,
	lazy = true,
	...props
}) {
	const [imageSrc, setImageSrc] = useState(lazy ? null : src);
	const imageRef = useRef();

	const callback = useCallback((entries) => {
		const [entry] = entries;
		if (entry.isIntersecting && imageSrc === null) {
			setImageSrc(src);
		}
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(callback, {
			root,
			rootMargin,
			threshold,
		});
		if (lazy) {
			observer.observe(imageRef.current);
		} else {
			observer.unobserve(imageRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, [callback, root, rootMargin, threshold, imageRef, lazy]);

	useEffect(() => {
		if (!lazy || imageSrc !== null) {
			setImageSrc(src);
		}
	}, [src]);

	return (
		<img
			alt={""}
			width={width}
			height={height}
			{...props}
			ref={imageRef}
			src={imageSrc}
			/*loading="lazy"*/
			data-lazy={true}
		/>
	);
}

export default LazyImage;
