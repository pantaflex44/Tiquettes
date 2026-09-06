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

import { useEffect, useMemo, useState } from "react";

import "../css/sourcesList.css";

import schemaSources from "../schema_sources.json" with { type: "json" };
import LazyImage from "./LazyImage";

function SourcesList({ sources, onSelect = null }) {
	const filteredSources = useMemo(() => {
		return (sources ?? [])
			.filter((s) => Object.keys(schemaSources).includes(s.id))
			.map((s) => ({ ...schemaSources[s.id], id: s.id }));
	}, [sources]);

	const [selected, setSelected] = useState([]);

	useEffect(() => {
		if (onSelect) {
			onSelect(selected);
		}
	}, [selected]);

	return (
		<div className="iconview">
			{filteredSources.map((s) => (
				<div
					key={s.id}
					className={`iconview_item ${selected.includes(s.id) ? "selected" : ""}`.trim()}
					title={s.description}
					onClick={() => {
						if (!selected.includes(s.id)) {
							setSelected((old) => [...old, s.id]);
						} else {
							setSelected((old) => old.filter((t) => t !== s.id));
						}
					}}
				>
					<LazyImage src={`./schema_${s.id}.svg`} width={48} height={48} />
					<div className="text">{s.name}</div>
				</div>
			))}
		</div>
	);
}

export default SourcesList;
