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

// Logique pure du collage (copier/couper/coller) des modules, sans état React.
// Un module = entrée du tableau `row` avec une propriété `span` (largeur en unités).
// Invariant d'une rangée valide: sum(span) === stepsPerRows (et donc row.length <= stepsPerRows).

// Position en unités (somme des spans des modules précédents) du module d'index moduleIndex.
export const pasteUnitPosition = (row, moduleIndex) => {
	let pos = 0;
	for (let k = 0; k < moduleIndex && k < row.length; k++) pos += row[k]?.span ?? 1;
	return pos;
};

// Somme des spans d'une rangée (unités occupées).
export const rowSpansSum = (row) =>
	row.reduce((a, m) => a + (m?.span ?? 0), 0);

// Un collage en (row, moduleIndex) est autorisé si et seulement si:
// - la position en unités de la cible + la largeur du presse-papiers tient dans la rangée
//   (position + clipboard.span <= stepsPerRows), le collage tenant exactement en fin de
//   rangée (=== stepsPerRows) étant autorisé;
// - si le module cible est plus petit que le presse-papiers, les modules suivants à absorber
//   existent, sont libres et de span 1.
// La vérification porte sur la somme des spans (unités), pas sur l'index de tableau.
export const modulePasteAllowedPure = (row, moduleIndex, clipboardSpan, stepsPerRows) => {
	if (!Array.isArray(row) || !row[moduleIndex]) return false;
	if (typeof clipboardSpan !== "number" || clipboardSpan < 1) return false;

	const currentModule = row[moduleIndex];
	const pos = pasteUnitPosition(row, moduleIndex);
	if (pos + clipboardSpan > stepsPerRows) return false;

	if (currentModule.span >= clipboardSpan) return true;

	const need = clipboardSpan - currentModule.span;
	for (let k = 1; k <= need; k++) {
		const m = row[moduleIndex + k];
		if (!m || m.free !== true || m.span !== 1) return false;
	}
	return true;
};

// Applique le collage aux rangées et renvoie les nouvelles rangées, ou null si le collage
// est refusé (la place à libérer n'a pas été entièrement disponible, ou une rangée
// résultante dépasserait: sum(span) > stepsPerRows ou length > stepsPerRows).
export const applyModulePasteRowsPure = (
	rows,
	rowIndex,
	moduleIndex,
	clipboard,
	clipboardMode,
	defaultModule,
	stepsPerRows,
	getNextId,
) => {
	let deleteLength = 0;
	let addLength = 0;

	const newRows = rows.map((row, i) => {
		let r = row.map((module, j) => {
			if (
				clipboardMode.mode === "cut" &&
				i === clipboardMode.rowIndex &&
				j === clipboardMode.moduleIndex
			) {
				return { ...defaultModule, span: module.span };
			}

			if (i !== rowIndex) return module;

			if (j === moduleIndex) {
				deleteLength = clipboard.span - module.span;
				addLength += module.span - clipboard.span;
			}

			// si le module qui va réceptionner le presse-papier est trop petit, on supprime les modules libres nécessaires pour libérer la place avant collage.
			if (j > moduleIndex && deleteLength > 0 && module.free && module.span === 1) {
				deleteLength--;
				return null;
			}

			if (j !== moduleIndex) return module;

			return {
				...module,
				id:
					clipboardMode.mode !== "cut"
						? getNextId(clipboard.id)
						: clipboard.id,
				free: clipboard.free,
				span: clipboard.span,
				icon: clipboard.icon,
				text: clipboard.text,
				desc: clipboard.desc,
				parentId: clipboard.parentId,
				srcId: clipboard.srcId,
				kcId: clipboard.kcId,
				kcType: clipboard.kcType,
				kcOrder: clipboard.ksOrder,
				partialKc: clipboard.partialKc,
				onlyChilds: clipboard.onlyChilds,
				noAutoId: clipboard.noAutoId,
				func: clipboard.func,
				crb: clipboard.crb,
				modtype: clipboard.modtype,
				type: clipboard.type,
				current: clipboard.current,
				sensibility: clipboard.sensibility,
				coef: clipboard.coef,
				pole: clipboard.pole,
				vref: clipboard.vref,
				wire: clipboard.wire,
				line: clipboard.line,
				grp: clipboard.grp,
				associateId: clipboard.associateId,
			};
		});

		r = r.filter((rr) => rr !== null);

		// si le module qui a réceptionné le presse-papier est désormais plus petit, alors on compense en ajoutant des modules libres
		if (addLength > 0) {
			for (let al = 0; al < addLength; al++) {
				r.splice(moduleIndex + 1, 0, { ...defaultModule });
			}
			addLength = 0;
		}

		return r;
	});

	// sécurité: la place devait être entièrement libérée (deleteLength retombé à 0) et
	// aucune rangée résultante ne doit dépasser stepsPerRows, sinon le collage est refusé.
	if (deleteLength > 0) return null;
	for (const r of newRows) {
		if (rowSpansSum(r) > stepsPerRows || r.length > stepsPerRows) return null;
	}

	return newRows;
};
