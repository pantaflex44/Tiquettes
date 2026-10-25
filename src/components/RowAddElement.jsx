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

import "../css/row.css";
import rowAddIcon from "../assets/row-add.svg";
import LazyImage from "./LazyImage";

function RowAddElement({ rowIndex, rowAddAllowed, onRowAdd, isFirstRow }) {
	return (
		<div
			className={`row_add ${isFirstRow ? "top" : ""} ${!rowAddAllowed() ? "disabled" : ""}`.trim()}
			title="Insérer une nouvelle rangée"
		>
			<LazyImage
				className="row_add_icon"
				src={rowAddIcon}
				width={24}
				height={24}
				alt="Ajouter une rangée"
				onClick={() => onRowAdd(rowIndex)}
			/>
			{rowAddAllowed() ? (
				<div className="row_add_info" onClick={() => onRowAdd(rowIndex)}>
					Insérer une nouvelle rangée ici
				</div>
			) : (
				<div className="row_add_info">Nombre de rangées maximum atteint</div>
			)}
			<div className="row_action_line"></div>
		</div>
	);
}

export default RowAddElement;
