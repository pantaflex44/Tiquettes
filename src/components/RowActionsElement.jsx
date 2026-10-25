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
import rowDownIcon from "../assets/arrow-down.svg";
import rowUpIcon from "../assets/arrow-up.svg";
import rowDeleteIcon from "../assets/trash.svg";
import LazyImage from "./LazyImage";

function RowActionsElement({
	rowIndex,
	rowPosition,
	rowDeleteAllowed,
	onRowDelete,
	onRowMoveUp,
	onRowMoveDown,
	isFirstRow,
	isLastRow,
}) {
	return (
		<div className="row_title" data-row={rowIndex}>
			<LazyImage
				className={`row_action_icon ${isFirstRow ? "disabled" : ""}`}
				src={rowUpIcon}
				width={20}
				height={20}
				alt="Remonter la rangée"
				title="Remonter la rangée"
				onClick={() => {
					onRowMoveUp(rowIndex);
				}}
			/>
			<LazyImage
				className={`row_action_icon ${isLastRow ? "disabled" : ""}`}
				src={rowDownIcon}
				width={20}
				height={20}
				alt="Descendre la rangée "
				title="Descendre la rangée"
				onClick={() => {
					onRowMoveDown(rowIndex);
				}}
			/>
			<LazyImage
				className={`row_action_icon ${!rowDeleteAllowed() ? "disabled" : ""}`}
				src={rowDeleteIcon}
				width={20}
				height={20}
				alt="Supprimer cette rangée"
				title="Supprimer cette rangée"
				onClick={() => {
					if (
						confirm(
							`Supprimer la rangée ${rowPosition} et tout ce qu'elle contient?`,
						)
					)
						onRowDelete(rowIndex);
				}}
			/>
			<span>Rangée {rowPosition}</span>
		</div>
	);
}

export default RowActionsElement;
