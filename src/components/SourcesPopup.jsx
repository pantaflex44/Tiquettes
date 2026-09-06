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

import { useMemo, useRef, useState } from "react";

import "../css/sourcesPopup.css";

import editIcon from "../assets/edit.svg";
import plusIcon from "../assets/plus.svg";
import trashIcon from "../assets/trash.svg";
import useDropdownToolbarMenuPlacing from "../hooks/useDropdownToolbarMenuPlacing.jsx";
import schemaSources from "../schema_sources.json" with { type: "json" };
import LazyImage from "./LazyImage.jsx";
import Popup from "./Popup.jsx";
import SourceEditor from "./SourceEditorPopup.jsx";
import SourceEditorPopup from "./SourceEditorPopup.jsx";
import SourcesList from "./SourcesList.jsx";

export default function SourcesPopup({ switchboard, onApply, onCancel }) {
	/*const listRef = useRef();

	const [sources, setSources] = useState(
		[
			...(switchboard.sources ??
				import.meta.env.VITE_SOURCES.split("|")
					.map((v) => v.trim())
					.filter((v) => v !== "")),
		].sort((a, b) => a.localeCompare(b)),
	);
	const [current, setCurrent] = useState([]);
	const [edit, setEdit] = useState([]);
	const isNew = useMemo(() => {
		const results = sources.filter((s) => s === edit);
		return edit === "" || (edit !== "" && results.length === 0);
	}, [sources, edit]);
	
	const countFromSource = (srcId) => {
		const l = switchboard.rows
			.map((r) => r.map((m) => m.srcId === srcId).filter((m) => m !== false))
			.filter((r) => r.length > 0).length;
		return l;
	};*/

	/*const ensureVisible = (srcId) => {
		setTimeout(() => {
			Array.from(listRef.current.options).forEach((o) => {
				console.log(o.value, srcId);
				if (o.value === srcId) {
					o.scrollIntoView();
				}
			});
		}, 500);
	};*/

	const navRef = useRef();
	const newMenuRef = useRef();

	const newDropdownMenuPlacement = useDropdownToolbarMenuPlacing(
		navRef,
		newMenuRef,
		320,
		50,
	);

	const [sources, setSources] = useState(switchboard.sources ?? []);
	const [selected, setSelected] = useState([]);
	const [editor, setEditor] = useState(null);

	const getNextFreeRef = (wantedRef) => {
		const ids = (sources ?? []).map((s) => s.id);
		let ref = wantedRef;
		let counter = 1;
		while (ids.includes(ref)) {
			ref = `${ref} ${counter}`;
			counter++;
		}
		//ref = ref.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents/diacritics
		return ref;
	};

	const cancel = () => {
		if (onCancel) onCancel();
	};

	const apply = () => {
		if (
			onApply &&
			JSON.stringify(switchboard.sources) !== JSON.stringify(sources)
		)
			onApply(sources);
	};

	return (
		<>
			<Popup
				title={"Gestion des sources"}
				showCloseButton={true}
				showOkButton={true}
				showCancelButton={true}
				width={500}
				onOk={apply}
				withOverflow={!editor}
				/*okButtonDisabled={
				switchboard.sources &&
				JSON.stringify(switchboard.sources) === JSON.stringify(sources)
			}*/
				onCancel={cancel}
			>
				<div className="popup_rows" style={{ flex: 1 }}>
					<nav
						className={"button_group"}
						style={{ marginBottom: 0, boxSizing: "border-box" }}
						ref={navRef}
					>
						<button
							type="button"
							className={"active dropdown_container"}
							title="Ajouter une source..."
							ref={newMenuRef}
						>
							<LazyImage src={plusIcon} width={16} height={16} />
							<span className={"responsive"}>Ajouter une source...</span>

							<div
								className="dropdown"
								style={{
									left: `${newDropdownMenuPlacement[0]}px`,
								}}
							>
								{Object.keys(schemaSources).map((id) => (
									<div
										key={id}
										className="dropdown_item_flex clickable"
										onClick={() =>
											setEditor({
												...schemaSources[id],
												id,
												label: getNextFreeRef(schemaSources[id].label),
											})
										}
									>
										<LazyImage
											src={`./schema_${id}.svg`}
											width={22}
											height={22}
										/>
										<span>{schemaSources[id].name}</span>
									</div>
								))}
							</div>
						</button>
						<div className="button_group-separator"></div>

						<button
							type="button"
							className={selected.length !== 1 ? "disabled" : ""}
							onClick={() => {}}
							title="Editer"
						>
							<LazyImage src={editIcon} width={16} height={16} />
							<span className={"responsive"}>Editer...</span>
						</button>
						<button
							type="button"
							className={selected.length === 0 ? "disabled" : ""}
							onClick={() => {}}
							title="Supprimer"
						>
							<LazyImage src={trashIcon} width={16} height={16} />
						</button>
						<div className="button_group-separator"></div>
					</nav>

					<div
						className="popup_row span"
						style={{
							alignItems: "flex-start",
							marginTop: "1rem",
						}}
					>
						<b>Liste des sources du projet</b>
					</div>
					<div
						className="popup_row span"
						style={{
							alignItems: "flex-start",
						}}
					>
						<SourcesList
							sources={sources}
							onSelect={(list) => {
								setSelected(list);
							}}
						/>
					</div>
				</div>
			</Popup>
			{editor && (
				<SourceEditorPopup
					getNextFreeRef={getNextFreeRef}
					source={editor}
					onCancel={() => setEditor(null)}
				/>
			)}
		</>
	);
}
