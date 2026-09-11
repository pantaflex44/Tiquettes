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

function SourcesList({
	sources,
	onSelect = null,
	onEdit = null,
	onDelete = null,
}) {
	const filteredSources = useMemo(() => {
		return (sources ?? [])
			.filter((s) => Object.keys(schemaSources).includes(s.base))
			.map((s) => ({ ...schemaSources[s.base], ...s }));
	}, [sources]);

	const [selected, setSelected] = useState([]);

	useEffect(() => {
		if (onSelect) {
			onSelect(selected);
		}
	}, [selected]);

	return (
		<div
			className="iconview"
			onMouseDown={(e) => {
				if (!e.ctrlKey) {
					setSelected([]);
				}
			}}
		>
			{filteredSources.map((s) => (
				<div
					key={s.id}
					className={`iconview_item ${selected.includes(s.id) ? "selected" : ""}`.trim()}
					title={s.description}
					onMouseUp={(e) => {
						if (e.ctrlKey) {
							if (!selected.includes(s.id)) {
								setSelected((old) => [...old, s.id]);
							} else {
								setSelected((old) => old.filter((t) => t !== s.id));
							}
						} else {
							setSelected([s.id]);
						}
					}}
					onDoubleClick={() => {
						if (onEdit) onEdit(s.id);
					}}
					onKeyUp={(e) => {
						if (e.code === "Delete" && onDelete) {
							onDelete([s.id]);
						}
					}}
				>
					<LazyImage src={`./schema_${s.base}.svg`} width={48} height={48} />
					<div className="label">{s.label}</div>
				</div>
			))}
		</div>
	);
}

export default SourcesList;
