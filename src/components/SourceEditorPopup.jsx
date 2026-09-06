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

import { useState } from "react";

import "../css/sourcesEditorPopup.css";

import schemaSources from "../schema_sources.json" with { type: "json" };
import EditorCurrentSelector from "./EditorCurrentSelector.jsx";
import EditorPoleSelector from "./EditorPoleSelector.jsx";
import EditorSensibilitySelector from "./EditorSensibilitySelector.jsx";
import EditorTypeSelector from "./EditorTypeSelector.jsx";
import EditorWireSelector from "./EditorWireSelector.jsx";
import LazyImage from "./LazyImage.jsx";
import Popup from "./Popup.jsx";

export default function SourceEditorPopup({
	getNextFreeRef,
	source = null,
	onApply = null,
	onCancel = null,
}) {
	const [editedSource, setEditedSource] = useState({ ...(source ?? {}) });

	const rulesCurrentWires = {
		2: 1,
		6: 1.5,
		10: 1.5,
		15: 1.5,
		16: 1.5,
		20: 2.5,
		25: 4,
		30: 6,
		32: 6,
		40: 10,
		45: 10,
		50: 16,
		60: 16,
		63: 16,
		80: 25,
		90: 25,
		100: 35,
		125: 50,
		160: 75,
		180: 75,
		240: 150,
		250: 150,
	};

	const cancel = () => {
		if (onCancel) onCancel();
	};

	const apply = () => {
		if (onApply && JSON.stringify(source) !== JSON.stringify(editedSource))
			onApply(editedSource);
	};

	return (
		<Popup
			title={editedSource.name}
			showCloseButton={true}
			showOkButton={true}
			showCancelButton={true}
			width={450}
			maxHeight={"97dvh"}
			onOk={apply}
			onCancel={cancel}
			withOverflow={true}
		>
			<div className="popup_rows" style={{ flex: 1, marginBottom: "1rem" }}>
				<div
					className="popup_row span"
					style={{
						alignItems: "flex-start",
						marginTop: 0,
						marginBottom: "1rem",
					}}
				>
					{editedSource.description}
				</div>

				<div
					className="popup_row"
					style={{
						"--left_column_size": "120px",
						/*borderBottom: "1px solid lightgray",
						paddingBottom: "1em",*/
					}}
				>
					<label htmlFor={`editor_label`}>Identification</label>
					<input
						type="text"
						name="editor_label"
						id={`editor_label`}
						value={editedSource.label ?? editedSource.id}
						onChange={(e) => {
							const freeLabel = getNextFreeRef(e.currentTarget.value);
							setEditedSource((old) => ({ ...old, label: freeLabel }));
						}}
						autoFocus={true}
					/>
				</div>

				{schemaSources[editedSource.id]?.hasType && (
					<>
						<div
							className="popup_row"
							style={{ "--left_column_size": "120px" }}
						>
							<label htmlFor={`editor_type`}>Type</label>
							<EditorTypeSelector
								id={`editor_type`}
								allowed={editedSource.type_allowed}
								value={editedSource.type ?? ""}
								onChange={(value) => {
									setEditedSource((old) => ({ ...old, type: value }));
								}}
							/>
						</div>
						<div
							className="popup_row"
							style={{ "--left_column_size": "120px" }}
						>
							<label htmlFor={`editor_sensibility`}>Sensibilité</label>
							<EditorSensibilitySelector
								id={`editor_sensibility`}
								allowed={editedSource.sensibility_allowed}
								value={editedSource.sensibility ?? ""}
								onChange={(value) => {
									setEditedSource((old) => ({ ...old, sensibility: value }));
								}}
							/>
						</div>
					</>
				)}

				{schemaSources[editedSource.id]?.hasCurrent && (
					<div
						className={`popup_row`.trim()}
						style={{ "--left_column_size": "120px" }}
					>
						<label htmlFor={`editor_current`}>Calibre</label>
						<EditorCurrentSelector
							id={`editor_current`}
							value={editedSource.current ?? ""}
							allowed={editedSource.current_allowed}
							onChange={(value) => {
								setEditedSource((old) => ({ ...old, current: value }));
							}}
						/>
					</div>
				)}

				{schemaSources[editedSource.id]?.hasWire && (
					<div className="popup_row" style={{ "--left_column_size": "120px" }}>
						<label htmlFor={`editor_wire`}>Section</label>
						<EditorWireSelector
							id={`editor_wire`}
							value={editedSource.wire ?? ""}
							onChange={(value) => {
								setEditedSource((old) => ({ ...old, wire: value }));
							}}
							current={parseInt(
								(
									(Array.isArray(editedSource.current ?? "")
										? editedSource.current[3]
										: (editedSource.current ?? "")) ?? ""
								).replace(/\D/g, ""),
								10,
							)}
							rules={Object.values(rulesCurrentWires)}
						/>
					</div>
				)}

				{schemaSources[editedSource.id]?.hasPole && (
					<div
						className={`popup_row`.trim()}
						style={{ "--left_column_size": "120px" }}
					>
						<label htmlFor={`editor_pole`}>Pôles</label>
						<EditorPoleSelector
							id={`editor_pole`}
							parentModule={null}
							value={editedSource.pole}
							allowed={editedSource.pole_allowed}
							onChange={(value, _vref) => {
								setEditedSource((old) => ({ ...old, pole: value }));
							}}
							style={{ flex: 1 }}
						/>
					</div>
				)}
			</div>
		</Popup>
	);
}
