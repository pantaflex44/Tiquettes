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

import "../css/schema.css";

import { Fragment } from "react";
import firstIcon from "../assets/caret-down-light.svg";
import LazyImage from "./LazyImage.jsx";
import SchemaDescription from "./SchemaDescription.jsx";
import SchemaSymbol from "./SchemaSymbol.jsx";

export default function SchemaItem({
	switchboard,
	baseId = null,
	isFirst = false,
	childs,
	onEditSymbol,
	monitor = {},
}) {
	return Object.entries(childs ?? {}).map(([id, item], j) => {
		const src = item.module.srcId
			? switchboard.sources.filter((s) => s.id === item.module.srcId)
			: null;
		return (
			<Fragment key={id}>
				<div
					className={`schemaItem ${isFirst ? "isFirst" : ""} ${item.isLast ? "isLast" : ""}`.trim()}
					data-isfirst={isFirst}
					data-islast={item.isLast}
					data-hasprev={item.hasPrev}
					data-hasnext={item.hasNext}
				>
					{isFirst && (
						<LazyImage className="schemaItemFirstIcon" src={firstIcon} />
					)}
					{isFirst && src && (
						<div className="schemaItemFirstIconTitle">
							{src[0].label.substring(0, 50)}
						</div>
					)}

					{(isFirst || item.hasPrev || item.hasNext) && (
						<div
							className={`schemaItemPrevLine ${!item.hasNext || isFirst ? "noNext" : ""} ${!item.hasPrev && !isFirst ? "noPrev" : ""}`.trim()}
						></div>
					)}

					{!isFirst && item.hasNext && (
						<div className="schemaItemNextLine"></div>
					)}

					<SchemaSymbol
						isLast={item.isLast}
						module={item.module}
						onEdit={(module) => {
							onEditSymbol(module);
						}}
						monitor={monitor}
					/>

					{item.isLast ? (
						<SchemaDescription module={item.module} />
					) : (
						<div className="schemaItemChilds">
							<SchemaItem
								switchboard={switchboard}
								childs={item.childs}
								baseId={baseId ?? item.module.id}
								onEditSymbol={(module) => {
									onEditSymbol(module);
								}}
								monitor={monitor}
							/>
						</div>
					)}
				</div>

				{isFirst && j < Object.keys(childs).length - 1 && (
					<div className="schemaItemSeparator"></div>
				)}
			</Fragment>
		);
	});
}
