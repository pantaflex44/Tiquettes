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

import asservOrderAfter from "../assets/asserv_order_after.svg";
import asservOrderBefore from "../assets/asserv_order_before.svg";

export default function EditorContactOrderSelector({
	id,
	value,
	disabled = false,
	onChange = null,
}) {
	return (
		<div
			className={`buttons_box ${disabled === true ? "disabled" : ""}`.trim()}
			style={{ flex: 0, marginRight: "3px" }}
			id={id}
			name={id}
		>
			<div
				className={`buttons_box-button ${value === "before" ? "selected" : ""}`.trim()}
				title="Les contacteurs sont positionnés en amont du module"
				onClick={() => onChange("before")}
			>
				<img
					src={asservOrderBefore}
					width={24}
					height={24}
					alt="Asservissement en amont du module"
				/>
			</div>

			<div
				className={`buttons_box-button ${value === "after" ? "selected" : ""}`.trim()}
				title="Les contacteurs sont positionnés en aval du module pour piloter le circuit associé"
				onClick={() => onChange("after")}
			>
				<img
					src={asservOrderAfter}
					width={24}
					height={24}
					alt="Asservissement en aval du module"
				/>
			</div>
		</div>
	);
}
