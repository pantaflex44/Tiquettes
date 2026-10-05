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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import autoAddRpsIcon from "../assets/auto-add-rps.svg";
import cancelIcon from "../assets/cancel.svg";
import compagnyIcon from "../assets/compagny.svg";
import groundIcon from "../assets/ground.svg";
import homeIcon from "../assets/home.svg";
import info2Icon from "../assets/info2.svg";
import monitorIcon from "../assets/monitor.svg";
import noautoAddRpsIcon from "../assets/no-auto-add-rps.svg";
import nogroundIcon from "../assets/noground.svg";
import nomonitorIcon from "../assets/nomonitor.svg";
import numbersIcon from "../assets/numbers.svg";
import sourcesIcon from "../assets/sources.svg";
import zoomPlusIcon from "../assets/zoom-in.svg";
import zoomMinusIcon from "../assets/zoom-out.svg";
import swbIcons from "../switchboard_icons.json";
import LazyImage from "./LazyImage.jsx";
import SchemaItem from "./SchemaItem.jsx";
import SourcesPopup from "./SourcesPopup.jsx";

export default function SchemaTab({
	tab,
	switchboard,
	setSwitchboard,
	printOptions,
	reassignModules,
	getModuleById,
	schemaFunctions,
	getFilteredModulesBySchemaFuncs,
	onEditSymbol = null,
}) {
	const [monitorOpened, setMonitorOpened] = useState(false);
	const [sourcesOpened, setSourcesOpened] = useState(false);
	const [zoomed, setZoomed] = useState(false);
	const monitorRef = useRef(null);

	const getCurrent = (module) => {
		const _currentCurrent = (module?.current ?? "0A").split("/");
		if (_currentCurrent.length > 0)
			return parseInt(
				_currentCurrent[_currentCurrent.length - 1].replace(/\D/g, ""),
				10,
			);
		return 0;
	};

	const getSimplyPole = (module) => {
		const p = (module?.pole ?? "1P+N").trim().toUpperCase();
		let pc = p.replace(/\D/g, "");
		if ((pc === 1 || pc === 3) && p.includes("+N")) pc++;
		if (pc < 2) pc = 2;
		if (pc > 4) pc = 4;
		return pc;
	};

	const flattedSwitchboard = useMemo(() => {
		const sources = (switchboard.sources ?? []).filter((s) => s.id);
		const findSource = (id) => sources.find((s) => s.id === id);

		let rpCnt = 1;
		let rps = {};

		let r = switchboard.rows.flatMap((row) =>
			row
				.map((module) => {
					if (!module?.id) return null;

					if (switchboard.autoAddRps) {
						const fc = (module.func ?? "").trim();
						const pi = (module.parentId ?? "-").trim();
						const s = findSource((module.srcId ?? "").trim());
						if (pi === "") {
							if (fc === "rp") {
								const ks = s?.id ?? "-";
								if (!rps[ks]) {
									rps = { ...rps, [ks]: { ...module, _auto: false } };
								}
							}
						}
					}

					return { ...module };
				})
				.filter((module) => module !== null)
				.map((module) => {
					if (switchboard.autoAddRps) {
						const fc = (module.func ?? "").trim();
						const pi = (module.parentId ?? "-").trim();
						const s = findSource((module.srcId ?? "").trim());
						if (pi === "") {
							if (fc !== "") {
								const ks = s?.id ?? "-";

								const rpBase = {
									id: `RP Auto ${rpCnt}`,
									kcId: "",
									parentId: "",
									srcId: ks,
									func: "rp",
									text: "Répartiteur de branchement",
									_auto: true,
								};

								rpCnt++;

								let id = rpBase.id;
								if (rps[ks]) {
									id = rps[ks].id;
								} else {
									rps[ks] = rpBase;
								}

								return fc !== "rp"
									? { ...module, srcId: "", parentId: id }
									: null;
							}
						}
					}

					return { ...module };
				})
				.filter((module) => module !== null),
		);

		if (switchboard.autoAddRps) {
			let tm = {};
			Object.values(rps).forEach((rp) => {
				const f = r.filter((m) => m.parentId === rp.id);
				if (f.length === 1) {
					tm = {
						...tm,
						[f[0].id]: { from: rp.id, parentId: rp.parentId, srcId: rp.srcId },
					};
				} else {
					const childsCount = r.filter((m) => m.parentId === rp.id).length;
					const remark =
						(rp?.remark ?? "") +
						`\r\nIl est préconisé d'utiliser un répartiteur avec minimum ${childsCount} départ${childsCount > 1 ? "s" : ""}`;

					if (rp._auto) {
						const childsCurrent = r
							.filter((m) => m.parentId === rp.id)
							.map((m) => getCurrent(m));

						const childsPole = r
							.filter((m) => m.parentId === rp.id)
							.map((m) => getSimplyPole(m));

						r = [
							...r,
							{
								...rp,
								current: `${Math.max(...childsCurrent)}A`,
								pole: `${Math.max(...childsPole)}P`,
								remark,
							},
						];
					} else {
						r = [
							...r,
							{
								...rp,
								remark,
							},
						];
					}
				}
			});

			Object.keys(tm).forEach((k) => {
				r = r.map((m) => {
					if (m.id === k) {
						return { ...m, parentId: tm[k].parentId, srcId: tm[k].srcId };
					}
					return m;
				});
			});
		}

		return r;
	}, [switchboard.rows, switchboard.sources, switchboard.autoAddRps]);

	const findInFlattedSwitchboard = useCallback(
		(id) => {
			const r = flattedSwitchboard.find((m) => m.id === id.trim());
			return r?.id && r?.id !== "" && r?.id !== "-" ? r : undefined;
		},
		[flattedSwitchboard],
	);

	useEffect(() => {
		if (monitorOpened) monitorRef.current.focus();
	}, [monitorOpened]);

	const handleEditSymbol = (module) => {
		const m = getModuleById(module.id);
		if (!m?.module) return;

		onEditSymbol(m.indexes.row, m.indexes.module);
	};

	const head = useMemo(() => {
		return flattedSwitchboard
			.map((module) => {
				const fc = (module.func ?? "").trim();
				const pi = (module.parentId ?? "-").trim();
				const pm = findInFlattedSwitchboard(pi);
				if (fc !== "" && (pi === "" || pi === "-" || !pm)) {
					const m = { ...module, parentId: "" };
					return m;
				}
				return null;
			})
			.filter((module) => module !== null);
	}, [flattedSwitchboard]);

	const getChilds = useCallback(
		(parentId) => {
			return flattedSwitchboard
				.map((module) => {
					if (
						(module.func ?? "").trim() !== "" &&
						module.parentId === parentId
					) {
						return module;
					}
					return null;
				})
				.filter((module) => module !== null);
		},
		[flattedSwitchboard],
	);

	const getRow = useCallback(
		(moduleList) => {
			let l = {};
			moduleList.forEach((module, _i) => {
				const _childs = getChilds(module.id);

				// si un module est asservi par un contacteur et que cet asservissement est positionné après le module,
				// alors on ajoute les contacts sous ce module pour indiquer l'asservissement
				if ((module.kcOrder ?? "after") !== "before") {
					const kcId = module.kcId ?? "";
					const kcId_a = kcId.split("|");
					kcId_a.forEach((k) => {
						const kcModule = findInFlattedSwitchboard(k);
						if (kcModule) {
							if (module.partialKc === true) {
								_childs.push({
									...module,
									kcId: "",
									id: `↓${module.id}`,
									parentId: module.id,
									func: "o",
									icon: module.icon,
									text: module.text,
								});
							}
							_childs.push({
								...kcModule,
								kcId: "",
								id: `¤_${kcModule.id}`,
								parentId: module.id,
								func: "k",
								icon: module.icon,
								text: module.partialKc === true ? kcModule.text : module.text,
								desc: module.partialKc === true ? kcModule.desc : module.desc,
								pole: module.pole,
								wire: module.wire,
							});
						}
					});

					if (
						_childs.length > 0 &&
						schemaFunctions[module.func]?.hasShareWithChilds === true &&
						module.onlyChilds === false
					) {
						_childs.push({
							...module,
							onlyChilds: true,
							partialKc: false,
							kcId: "",
							id: `↓_${module.id}`,
							parentId: module.id,
							func: "o",
							icon: module.icon,
							text: module.text,
						});
					}

					const childs = getRow(_childs);

					l[module.id] = {
						module,
						childs,
						isLast: Object.keys(childs).length === 0,
						hasBrothers:
							Object.keys(getChilds(module.parentId) ?? {}).length > 0,
					};
				}
			});

			const e = Object.entries(l);
			for (let i = 0; i < e.length; i++) {
				e[i] = [
					e[i][0],
					{
						...e[i][1],
						hasPrev: i > 0,
						hasNext: i < e.length - 1,
					},
				];
			}
			l = Object.fromEntries(e);

			return l;
		},
		[switchboard.rows],
	);

	const tree = useMemo(() => {
		return { childs: getRow(head) };
	}, [head]);

	const monitor = useMemo(() => {
		if (!switchboard.schemaMonitor) return {};

		let result = {};
		let nbIdTypeA30 = 0;
		let nbIdTypeAC30 = 0;

		function add_error(id, message) {
			const errors = (result.errors ?? [])[id] ?? [];
			if (!errors.includes(message)) errors.push(message);
			if (errors.length > 0)
				result = { ...result, errors: { ...result.errors, [id]: errors } };
		}

		function add_info(id, message) {
			const infos = (result.infos ?? [])[id] ?? [];
			if (!infos.includes(message)) infos.push(message);
			if (infos.length > 0)
				result = { ...result, infos: { ...result.infos, [id]: infos } };
		}

		function monitor_runtime(
			childs,
			lastParentModule = null,
			lastParentModuleId = null,
		) {
			let _lastParentModuleId = lastParentModuleId;

			Object.entries(childs).forEach(([id, data]) => {
				const isTri = (pole) =>
					pole === "3P" || pole === "4P" || pole === "3P+N";
				const isTetra = (pole) => pole === "4P" || pole === "3P+N";
				const isMono = (pole) => pole === "1P+N" || pole === "2P";

				const getCurrent = (module) => {
					const _currentCurrent = (module?.current ?? "0A").split("/");
					if (_currentCurrent.length > 0)
						return parseInt(
							_currentCurrent[_currentCurrent.length - 1].replace(/\D/g, ""),
							10,
						);
					return 0;
				};

				const getComputedCurrent = (computedCurrent) => {
					const _currentCurrent = computedCurrent.split("/");
					if (_currentCurrent.length > 0)
						return parseInt(
							_currentCurrent[_currentCurrent.length - 1].replace(/\D/g, ""),
							10,
						);
					return 0;
				};

				const getVref = (module) => {
					const _currentVref = (
						module?.vref ?? import.meta.env.VITE_VREF_230V
					).split("/");
					if (_currentVref.length > 0)
						return parseInt(
							_currentVref[_currentVref.length - 1].replace(/\D/g, ""),
							10,
						);
					return 0;
				};

				const getFunc = (module) => {
					return module?.func;
				};

				const getSensibility = (module) => {
					return parseInt((module?.sensibility ?? "0").replace(/\D/g, ""), 10);
				};

				const getType = (module) => {
					return (module?.type ?? "").toUpperCase();
				};

				const getId = (module) => {
					return module?.id;
				};

				const getPole = (module) => {
					return module?.pole;
				};

				const getSource = (module) => {
					return switchboard.sources.find((s) => s.id === module?.srcId);
				};

				const getTrueCoef = (module) => {
					return switchboard.projectType === "R" && isMono(currentPole)
						? Math.round((module?.coef ?? 0.5) * 10) / 10
						: 1;
				};

				const getTrueFactor = (module) => {
					return (module?.pole ?? "") === "3P" ? Math.sqrt(3) : 1;
				};

				const getIconDetails = (module) => {
					const icon = module?.icon ?? "";
					const found = swbIcons.filter((i) => i.filename === icon);
					return found.length === 1 ? found[0] : null;
				};

				const getParentByModule = (module) => {
					const parent = Object.entries(getFilteredModulesBySchemaFuncs())
						.map(([_k, l]) => {
							const res = l
								.map((m) => (module?.parentId === m.id ? m : null))
								.filter((f) => f !== null);

							if (res.length === 1) return res[0];
							return null;
						})
						.filter((f) => f !== null);
					if (!parent || !Array.isArray(parent)) return null;

					if (parent.length !== 1) return null;

					return parent[0];
				};

				const applyPowerRound = (value) => {
					if (value >= 1000)
						return {
							value: Math.round((value / 1000) * 100) / 100,
							unit: "kW",
						};
					if (value >= 1000000)
						return {
							value: Math.round((value / 1000000) * 100) / 100,
							unit: "m.W",
						};
					return { value, unit: "W" };
				};

				const source = switchboard.sources.find(
					(s) => s.id === data.module.srcId,
				);
				const parentPole = lastParentModule?.pole ?? source?.pole ?? null;
				const parentCurrent = getCurrent(lastParentModule);
				const currentPole = getPole(data.module);
				const currentFunc = getFunc(data.module);
				const currentCurrent = getCurrent(data.module);
				const currentPower = currentCurrent * getVref(data.module);
				const currentSource = getSource(data.module);
				const vDivider =
					getVref(data.module) *
					(isTri(currentPole) ? 3 : isMono(currentPole) ? 1 : 1);

				let refCurrent = currentCurrent;
				if (!refCurrent || refCurrent <= 0)
					refCurrent = getComputedCurrent(currentSource?.current ?? "0A");

				// Le module courant est un répartiteur
				if (currentFunc === "rp" && getId(data.module)) {
					const powers = Object.entries(data.childs).map(([_, cdata]) => {
						const c = getCurrent(cdata.module);
						return c ? c : 0;
					});
					const pcm = Math.max(...powers);
					if (currentCurrent > 0 && pcm > currentCurrent) {
						add_error(
							id,
							`Le répartiteur doit avoir un calibre supérieur ou égal à la charge maximale de ses départs (${pcm}A).`,
						);
					}
				}

				// Le module courant est un interrupteur différentiel
				if (currentFunc === "id" && getId(data.module)) {
					const powers = Object.entries(data.childs).map(([_, cdata]) => {
						if (getFunc(cdata.module) === "q")
							return (
								((getCurrent(cdata.module) * getTrueCoef(cdata.module)) /
									getTrueFactor(cdata.module)) *
								getVref(cdata.module)
							);
						return 0;
					});
					const total = Math.ceil(
						powers.reduce((partialSum, a) => partialSum + a, 0) / vDivider,
					);

					if (total > currentCurrent) {
						if (lastParentModule) {
							let prt = lastParentModule;
							do {
								const prtFunc = getFunc(prt);
								if (prtFunc !== "q" && prtFunc !== "rp") {
									break;
								}
								const rc = getCurrent(prt);
								if (rc > 0 && rc < refCurrent) {
									refCurrent = rc;
								}
								const prtTemp = getParentByModule(prt);
								if (!prtTemp) {
									const refCurrentTemp = getComputedCurrent(
										getSource(prt)?.current ?? prt.current ?? "0A",
									);
									if (refCurrentTemp > 0 && refCurrentTemp < refCurrent) {
										refCurrent = refCurrentTemp;
									}
								}
								prt = prtTemp;
							} while (prt);
						} else {
							refCurrent = getComputedCurrent(currentSource?.current ?? "0A");
						}

						// erreur seulement si la charge > DDR (regle de l'aval - DDR >= total charges)
						if (refCurrent <= 0 || currentCurrent <= refCurrent) {
							// et seulement si le DDR < AGCP (règle de l'amont - DDR >= AGCP):
							add_error(
								id,
								`La charge retenue (${total}A) est supérieure à la limite définie: ${currentCurrent}A`,
							);
						}
					}

					if (
						switchboard.projectType === "R" &&
						Object.keys(data.childs).length > 8
					)
						add_error(
							id,
							`La norme NFC 15-100 autorise un maximum de 8 circuits par interrupteur différentiel.`,
						);

					if (switchboard.projectType === "R") {
						const sensibility = getSensibility(data.module);
						if (getType(data.module) === "A" && sensibility === 30)
							nbIdTypeA30++;
						if (getType(data.module) === "AC" && sensibility === 30)
							nbIdTypeAC30++;
					}

					add_info(
						id,
						`La charge est de ${total}A pour un courant limité à ${refCurrent ? `${refCurrent}A` : "une valeur inconnue"}`,
					);

					_lastParentModuleId = data.module;
				}

				// Le module courant est un disjoncteur
				if (currentFunc === "q" && getId(data.module)) {
					const powerDetails = applyPowerRound(
						currentPower * (isTetra(data.module) ? 3 : 1),
					);
					add_info(
						id,
						`Puissance maximum admissible: ${powerDetails.value}${powerDetails.unit}`,
					);

					const iconDetails = getIconDetails(data.module);
					if (iconDetails?.requiredIdTypes) {
						if (
							!iconDetails.requiredIdTypes.includes(
								_lastParentModuleId?.type ?? "",
							)
						) {
							const _parentType = (_lastParentModuleId?.type ?? "").trim();
							const _hasParentType = _parentType !== "";

							add_error(
								id,
								`Ce départ doit être couvert par une protection différentielle de type: ${iconDetails.requiredIdTypes.join(", ")}. ${_hasParentType ? `Type actuel: ${_parentType}` : `Protection différentielle incompatible.`}`,
							);
						}
					}
				}

				// Vérification du câblage du module courant (cohérence des pôles)
				if (
					currentPole &&
					parentPole &&
					(((parentPole === "1P+N" || parentPole === "2P") &&
						currentPole !== "1P+N" &&
						currentPole !== "2P") ||
						(parentPole === "3P" && currentPole !== "3P") ||
						((parentPole === "1P+N" ||
							parentPole === "2P" ||
							parentPole === "3P") &&
							(currentPole === "4P" || currentPole === "3P+N")))
				) {
					add_error(
						id,
						`Câblage incohérent. Le nombre de pôles du module parent (${lastParentModule.id}: ${parentPole}) ne permet pas de câbler correctement ce module (${currentPole}).`,
					);
				}

				// Vérification du calibre de la protection en tète des contacts d'asservissements
				if (currentFunc === "k" && getId(data.module) && lastParentModule) {
					if (currentCurrent < parentCurrent) {
						add_error(
							lastParentModule.id,
							`Le calibre est incohérent avec la capacité du contacteur d'asservissement (${lastParentModule.id}: ${parentCurrent}A / ${id}: ${currentCurrent}A).`,
						);
					}
				}

				// Pour finir, on passe aux modules enfants
				monitor_runtime(data.childs, data.module, _lastParentModuleId);
			});
		}

		monitor_runtime(tree.childs);

		// Dans un projet résidentiel, on vérifie le nombre d'interrupteurs différentiels obligatoire
		if (switchboard.projectType === "R" && nbIdTypeA30 + nbIdTypeAC30 < 2) {
			add_error(
				"Global",
				`Une installation électrique résidentielle doit être protégée par au moins 2 interrupteurs différentiels de sensibilité: 30mA.`,
			);
		}

		return result;
	}, [tree?.childs, switchboard]);
	const monitorWarningsLength = useMemo(
		() => Object.values(monitor.errors ?? {}).flatMap((e) => e.flat()).length,
		[monitor],
	);

	return (
		<>
			<div
				className={`schema ${tab === 2 ? "selected" : ""} ${printOptions.schema ? "printable" : "notprintable"}`.trim()}
				style={{ "--schema-scale": zoomed ? "1.5" : "1" }}
			>
				<div className="tabPageBand notprintable">
					<div className="tabPageBandGroup">
						<div className="tabPageBandCol">
							<span style={{ fontSize: "smaller", lineHeight: 1.2 }}>
								Type
								<br />
								d'installation:
							</span>
						</div>
						<div className="tabPageBandCol">
							<input
								type="checkbox"
								name="schemaProjectTypeR"
								id="schemaProjectTypeR"
								checked={switchboard.projectType === "R"}
								onChange={() =>
									setSwitchboard((old) => ({ ...old, projectType: "R" }))
								}
							/>
							<label htmlFor="schemaProjectTypeR" title="Project résidentiel">
								<LazyImage
									src={homeIcon}
									alt="Project résidentiel"
									width={24}
									height={24}
								/>
							</label>
						</div>
						<div className="tabPageBandCol">
							<input
								type="checkbox"
								name="schemaProjectTypeT"
								id="schemaProjectTypeT"
								checked={switchboard.projectType === "T"}
								onChange={() =>
									setSwitchboard((old) => ({ ...old, projectType: "T" }))
								}
							/>
							<label htmlFor="schemaProjectTypeT" title="Project tertiaire">
								<LazyImage
									src={compagnyIcon}
									alt="Project tertiaire"
									width={24}
									height={24}
								/>
							</label>
						</div>
					</div>
					<div className="tabPageBandSeparator"></div>

					<div className="tabPageBandGroup">
						<div className="tabPageBandCol">
							<span style={{ fontSize: "smaller", lineHeight: 1.2 }}>
								Alimentations:
							</span>
						</div>
						<div className="tabPageBandCol">
							<button
								id="schemaSourcesBtn"
								type="button"
								style={{ height: "34px" }}
								title="Gérer les sources"
								onClick={() => setSourcesOpened(true)}
							>
								<LazyImage
									src={sourcesIcon}
									alt="Gérer les sources"
									width={22}
									height={22}
								/>
								<span>Sources</span>
							</button>
						</div>
						<div className="tabPageBandCol">
							<input
								type="checkbox"
								name="schemaAutoAddRps"
								id="schemaAutoAddRps"
								checked={switchboard.autoAddRps}
								onChange={() =>
									setSwitchboard((old) => ({
										...old,
										autoAddRps: !old.autoAddRps,
									}))
								}
							/>
							<label
								htmlFor="schemaAutoAddRps"
								title="Ajouter et regrouper automatiquement les répartiteurs de branchement aux différentes sources définies."
							>
								<LazyImage
									src={
										switchboard.autoAddRps ? autoAddRpsIcon : noautoAddRpsIcon
									}
									alt="Répartiteurs de branchement"
									width={24}
									height={24}
								/>
							</label>
						</div>
						<div className="tabPageBandCol">
							<input
								type="checkbox"
								name="schemaWithGroundChoice"
								id="schemaWithGroundChoice"
								checked={switchboard.withGroundLine}
								onChange={() =>
									setSwitchboard((old) => ({
										...old,
										withGroundLine: !old.withGroundLine,
									}))
								}
							/>
							<label
								htmlFor="schemaWithGroundChoice"
								title="Représenter le bornier de terre"
							>
								<LazyImage
									src={switchboard.withGroundLine ? groundIcon : nogroundIcon}
									alt="Bornier de terre"
									width={24}
									height={24}
								/>
							</label>
						</div>
					</div>

					<div className="tabPageBandNL"></div>

					<div className="tabPageBandGroup">
						<div className="tabPageBandCol">
							<input
								type="checkbox"
								name="schemaMonitorZoom"
								id="schemaMonitorZoom"
								checked={zoomed}
								onChange={() => setZoomed((old) => !old)}
							/>
							<label
								htmlFor="schemaMonitorZoom"
								title="Agrandir visuellement le schéma"
							>
								<LazyImage
									src={zoomed ? zoomMinusIcon : zoomPlusIcon}
									alt="Zoom"
									width={24}
									height={24}
								/>
							</label>
						</div>

						<div className="tabPageBandSeparator"></div>
						<div className="tabPageBandCol">
							<button
								id="schemaReassignModulesBtn"
								type="button"
								style={{ height: "34px" }}
								title="Ré-assigner automatiquement les identifiants des modules de l'ensemble du projet."
								onClick={() => reassignModules()}
							>
								<LazyImage
									src={numbersIcon}
									alt="Ré-assigner automatiquement les identifiants"
									width={22}
									height={22}
								/>
							</button>
						</div>

						<div className="tabPageBandCol">
							<input
								type="checkbox"
								name="schemaMonitorChoice"
								id="schemaMonitorChoice"
								checked={switchboard.schemaMonitor}
								onChange={() =>
									setSwitchboard((old) => ({
										...old,
										schemaMonitor: !old.schemaMonitor,
									}))
								}
							/>
							<label
								htmlFor="schemaMonitorChoice"
								title="Conseils et Surveillance (NFC 15-100)"
								className={`${monitor.errors ? "error" : ""}`}
							>
								<LazyImage
									src={switchboard.schemaMonitor ? monitorIcon : nomonitorIcon}
									alt="Conseils et Surveillance (NFC 15-100)"
									width={24}
									height={24}
								/>
							</label>
						</div>
						{switchboard.schemaMonitor && (
							<div className="tabPageBandCol">
								{monitorWarningsLength > 0 ? (
									<>
										<span>{`${monitorWarningsLength} erreur${monitorWarningsLength > 1 ? "s" : ""} détectée${monitorWarningsLength > 1 ? "s" : ""}.`}</span>
										<LazyImage
											src={info2Icon}
											alt="Détails des erreurs"
											title="Détails des erreurs"
											width={20}
											height={20}
											style={{ cursor: "pointer", padding: "4px" }}
											onClick={() => setMonitorOpened((old) => !old)}
										/>
									</>
								) : (
									<span>Aucune erreur détectée.</span>
								)}
							</div>
						)}
					</div>
				</div>

				{switchboard.schemaMonitor && monitorOpened && monitor.errors && (
					<div
						className="tabPageBand notprintable errors"
						ref={monitorRef}
						tabIndex={-1}
						onBlur={() => setMonitorOpened(false)}
					>
						<div
							className="closeButton"
							title={"Fermer"}
							onClick={() => setMonitorOpened(false)}
						>
							<LazyImage
								src={cancelIcon}
								width={24}
								height={24}
								alt={"Fermer"}
							/>
						</div>
						<div
							className="tabPageBandCol"
							style={{
								height: "max-content",
								minHeight: "max-content",
								maxHeight: "max-content",
							}}
						>
							<ul>
								{Object.entries(monitor.errors ?? {}).map(([id, errors], i) => (
									<li key={i} className="tabPageErrors">
										<div>{id}:</div>
										<ul>
											{errors.map((error, j) => (
												<li key={j} className="tabPageError">
													<LazyImage
														src={`${import.meta.env.BASE_URL}schema_warning.svg`}
														alt="Erreurs"
														width={16}
														height={16}
													/>
													<span>{error}</span>
												</li>
											))}
										</ul>
									</li>
								))}
							</ul>
						</div>
					</div>
				)}

				<div className="schemaGrid">
					<div className="schemaItemSeparator first"></div>
					<SchemaItem
						switchboard={switchboard}
						childs={tree.childs}
						isFirst={true}
						parentIsFirst={true}
						onEditSymbol={(module) => handleEditSymbol(module)}
						monitor={monitor}
					/>

					{switchboard.withGroundLine && (
						<div className="schemaGroundLine">
							<LazyImage
								className=""
								src={`${import.meta.env.VITE_APP_BASE}circuit-ground.svg`}
								width={24}
								height={24}
							/>
						</div>
					)}
				</div>
			</div>

			{sourcesOpened && (
				<SourcesPopup
					switchboard={switchboard}
					onApply={(sources) => {
						setSwitchboard((old) => {
							return {
								...old,
								sources,
								/*rows: old.rows.map((r) => {
									return r.map((m) => {
										return !sources.includes(m.srcId) ? { ...m, srcId: "" } : m;
									});
								}),*/
							};
						});

						setSourcesOpened(false);
					}}
					onCancel={() => setSourcesOpened(false)}
				/>
			)}
		</>
	);
}
