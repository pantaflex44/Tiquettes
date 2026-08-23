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

import { useEffect, useRef, useState } from "react";
import "../css/firstpageSettingsPopup.css";
import * as pkg from "../../package.json" with { type: "json" };
import clearIcon from "../assets/clear.svg";
import currentLocationIcon from "../assets/current-location.svg";

import dataIcon from "../assets/database.svg";
import exportIcon from "../assets/download.svg";
import downloadIcon from "../assets/download.svg";
import eyeIcon from "../assets/eye.svg";
import infoIcon from "../assets/info-circle.svg";
import callIcon from "../assets/phone-call.svg";
import photoOffIcon from "../assets/photo-off.svg";
import sendIcon from "../assets/send.svg";
import trashIcon from "../assets/trash.svg";
import importIcon from "../assets/upload.svg";
import zoomInIcon from "../assets/zoom-in.svg";
import zoomOutIcon from "../assets/zoom-out.svg";
import zoomRealIcon from "../assets/zoom-scan.svg";
import {
	humanFileSize,
	mimeTypeToExtension,
	sanitizeFileName,
} from "../others/files.js";
import LazyImage from "./LazyImage.jsx";
import Popup from "./Popup.jsx";

export default function FirstpageSettingsPopup({
	defaultFirstpageOptions,
	onCancel,
	onApply,
	switchboard = null,
	printOptions = null,
	withPreview = true,
	withViewSelector = true,
	withOverflow = true,
	currentInfos = null,
	currentViews = null,
}) {
	const importLogoRef = useRef();

	const [tab, setTab] = useState(1);
	const [zoom, setZoom] = useState(100);

	const fromNameRef = useRef();
	const fromSiretRef = useRef();
	const fromPostalAddressRef = useRef();
	const fromEmailRef = useRef();
	const fromPhoneRef = useRef();

	const toNameRef = useRef();
	const toPostalAddressRef = useRef();
	const toEmailRef = useRef();
	const toPhoneRef = useRef();

	const importRef = useRef();

	const merge = (a, b) =>
		[a, b].reduce(
			(r, o) =>
				Object.entries(o).reduce(
					(q, [k, v]) => ({
						...q,
						[k]: v && typeof v === "object" ? merge(q[k] || {}, v) : v,
					}),
					r,
				),
			{},
		);
	const loadOptions = () => {
		return merge(defaultFirstpageOptions, {
			infos: merge(
				defaultFirstpageOptions.infos,
				switchboard?.firstPageInfos ?? currentInfos ?? {},
			),
			views: merge(
				defaultFirstpageOptions.views,
				printOptions?.pdfOptions?.firstPageView ?? currentViews ?? {},
			),
		});
	};
	const [options, setOptions] = useState(loadOptions());

	const exportData = () => {
		const o = {
			infos: { from: { ...options.infos.from } },
			views: { ...options.views },
		};

		const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(o))}`;
		const link = document.createElement("a");
		link.href = jsonString;
		link.download = `Tiquettes - Données personnelles.json`;
		link.click();
	};

	const _importData = (data) => {
		try {
			const o = typeof data === "string" ? JSON.parse(data) : data;
			setOptions((old) => {
				const opt = merge(old, o);
				return opt;
			});
			return true;
		} catch (_err) {
			importRef.current.value = "";
			alert("Impossible d'importer ces données.");
			return false;
		}
	};

	const importData = (file) => {
		if (file) {
			const fileReader = new FileReader();
			fileReader.readAsText(file, "UTF-8");
			fileReader.onload = (e) => _importData(e.target.result);
		} else {
			importRef.current.value = "";
			alert("Aucunes données à importer!");
		}
	};

	const importLogo = (file) => {
		try {
			if (file) {
				const maxFileSize = 1 * 1024 * 1024;
				if (file.size > maxFileSize) {
					// 1Mo
					alert(
						"Votre logo ne doit pas dépasser le poids de " +
							humanFileSize(maxFileSize) +
							". Poids retenu pour ce fichier: " +
							humanFileSize(file.size) +
							".",
					);
					return;
				}

				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					const dataURL = fileReader.result;
					setOptions((old) => ({
						...old,
						infos: {
							...(old.infos ?? {}),
							from: {
								...(old.infos?.from ?? {}),
								logo: dataURL,
							},
						},
					}));
				};
				fileReader.readAsDataURL(file);
			} else {
				importLogoRef.current.value = "";
				alert("Aucun logo à importer!");
			}
		} catch (err) {
			console.log(err);
			importLogoRef.current.value = "";
			alert("Impossible d'importer le logo.");
			return false;
		}
	};

	const exportLogo = () => {
		const fromName = (options.infos.from.name ?? "logo").trim();
		const fromLogo = (options.infos.from.logo ?? "").trim();
		if (fromLogo === "") {
			alert("Aucun logo à exporter!");
			return;
		}

		const mimetype = fromLogo.substring(
			fromLogo.indexOf(":") + 1,
			fromLogo.indexOf(";"),
		);
		const byteString = atob(fromLogo.split(",")[1]);

		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		const url = URL.createObjectURL(new Blob([ab], { type: mimetype }));

		const link = document.createElement("a");
		link.href = url;
		link.download = sanitizeFileName(
			`${fromName}.${mimeTypeToExtension(mimetype)}`,
		);
		link.click();
	};

	const resetOptions = () => {
		setOptions({
			infos: defaultFirstpageOptions.infos,
			views: defaultFirstpageOptions.views,
		});
	};

	/*function url_validation(url, withHttp = true) {
		if (!withHttp) {
			const regexp =
				/^((http|https):\/\/)?(www[.])?([a-zA-Z0-9]|-)+([.][a-zA-Z0-9(-|/|=|?)?]+)+$/;
			return regexp.test(url);
		} else {
			const regexp =
				/^((http|https):\/\/){1}(www[.])?([a-zA-Z0-9]|-)+([.][a-zA-Z0-9(-|/|=|?)?]+)+$/;
			return regexp.test(url);
		}
	}*/

	function siret_validation(siret) {
		const validate = (number, size) => {
			const n = number.replace(/\s/g, "");
			if (Number.isNaN(n) || n.length !== size) return false;
			let bal = 0;
			let total = 0;
			for (let i = size - 1; i >= 0; i--) {
				const step = (n.charCodeAt(i) - 48) * (bal + 1);
				total += step > 9 ? step - 9 : step;
				bal = 1 - bal;
			}
			return total % 10 === 0;
		};
		const isSiret = () => validate(siret, 14);
		const isSiren = () => validate(siret, 9);
		return { isSiret, isSiren };
	}

	function email_validation(email) {
		return email.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);
	}

	function name_validation(name) {
		return name.trim().length > 1;
	}

	// biome-ignore lint/correctness/noUnusedFunctionParameters: wanted
	function phone_validation(phone) {
		return true;
	}

	// biome-ignore lint/correctness/noUnusedFunctionParameters: wanted
	function postalAddress_validation(address) {
		return true;
	}

	useEffect(() => {
		if (
			options?.infos?.from?.name &&
			options.infos.from.name.trim() !== "" &&
			!name_validation(options.infos.from.name.trim())
		) {
			fromNameRef.current.classList.add("invalid");
		} else {
			fromNameRef.current.classList.remove("invalid");
		}

		const validate = siret_validation(
			(options?.infos?.from?.siret ?? "").trim(),
		);
		if (
			options?.infos?.from?.siret &&
			options.infos.from.siret.trim() !== "" &&
			!validate.isSiret() &&
			!validate.isSiren()
		) {
			fromSiretRef.current.classList.add("invalid");
		} else {
			fromSiretRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.from?.postalAddress &&
			options.infos.from.postalAddress.trim() !== "" &&
			!postalAddress_validation(options.infos.from.postalAddress.trim())
		) {
			fromPostalAddressRef.current.classList.add("invalid");
		} else {
			fromPostalAddressRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.from?.email &&
			options.infos.from.email.trim() !== "" &&
			!email_validation(options.infos.from.email.trim())
		) {
			fromEmailRef.current.classList.add("invalid");
		} else {
			fromEmailRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.from?.phone &&
			options.infos.from.phone.trim() !== "" &&
			!phone_validation(options.infos.from.phone.trim())
		) {
			fromPhoneRef.current.classList.add("invalid");
		} else {
			fromPhoneRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.to?.name &&
			options.infos.to.name.trim() !== "" &&
			!name_validation(options.infos.to.name.trim())
		) {
			toNameRef.current.classList.add("invalid");
		} else {
			toNameRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.to?.postalAddress &&
			options.infos.to.postalAddress.trim() !== "" &&
			!postalAddress_validation(options.infos.to.postalAddress.trim())
		) {
			toPostalAddressRef.current.classList.add("invalid");
		} else {
			toPostalAddressRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.to?.email &&
			options.infos.to.email.trim() !== "" &&
			!email_validation(options.infos.to.email.trim())
		) {
			toEmailRef.current.classList.add("invalid");
		} else {
			toEmailRef.current.classList.remove("invalid");
		}

		if (
			options?.infos?.to?.phone &&
			options.infos.to.phone.trim() !== "" &&
			!phone_validation(options.infos.to.phone.trim())
		) {
			toPhoneRef.current.classList.add("invalid");
		} else {
			toPhoneRef.current.classList.remove("invalid");
		}
	}, [options]);

	const cancel = () => {
		if (onCancel) onCancel();
	};

	const apply = () => {
		let finalOptions = { ...options };

		if (onApply) {
			const fromName = (finalOptions.infos.from.name ?? "").trim();
			if (fromName !== "") {
				if (!name_validation(fromName)) {
					alert("Nom de l'installateur incorrect.");
					return;
				}
			}

			const fromLogo = (finalOptions.infos.from.logo ?? "").trim();
			if (fromLogo === "") {
				finalOptions = {
					...finalOptions,
					views: {
						...(finalOptions.views ?? {}),
						from: {
							...(finalOptions.views?.from ?? {}),
							logo: false,
						},
					},
				};
			}

			const fromSiret = (finalOptions.infos.from.siret ?? "").trim();
			if (fromSiret !== "") {
				const fromSiretValidation = siret_validation(fromSiret);
				if (!fromSiretValidation.isSiren() && !fromSiretValidation.isSiret()) {
					alert("Le numéro de SIRET / SIREN est incorrect.");
					return;
				}
			}

			const fromPostalAddress = (
				finalOptions.infos.from.postalAddress ?? ""
			).trim();
			if (fromPostalAddress !== "") {
				if (!postalAddress_validation(fromPostalAddress)) {
					alert("Adresse postale de l'installateur incorrecte.");
					return;
				}
			}

			const fromEmail = (finalOptions.infos.from.email ?? "").trim();
			if (fromEmail !== "") {
				if (!email_validation(fromEmail)) {
					alert("L'adresse email de l'installateur est incorrecte.");
					return;
				}
			}

			const fromPhone = (finalOptions.infos.from.phone ?? "").trim();
			if (fromPhone !== "") {
				if (!phone_validation(fromPhone)) {
					alert("Le numéro de téléphone de l'installateur est incorrect.");
					return;
				}
			}

			const toName = (finalOptions.infos.to.name ?? "").trim();
			if (toName !== "") {
				if (!name_validation(toName)) {
					alert("Nom du client incorrect.");
					return;
				}
			}

			const toPostalAddress = (
				finalOptions.infos.to.postalAddress ?? ""
			).trim();
			if (toPostalAddress !== "") {
				if (!postalAddress_validation(toPostalAddress)) {
					alert("Adresse postale du client incorrecte.");
					return;
				}
			}

			const toEmail = (finalOptions.infos.to.email ?? "").trim();
			if (toEmail !== "") {
				if (!email_validation(toEmail)) {
					alert("L'adresse email du client est incorrecte.");
					return;
				}
			}

			const toPhone = (finalOptions.infos.to.phone ?? "").trim();
			if (toPhone !== "") {
				if (!phone_validation(toPhone)) {
					alert("Le numéro de téléphone du client est incorrect.");
					return;
				}
			}

			onApply(finalOptions);
		}
	};

	return (
		<Popup
			title={"Renseigner les données du projet"}
			showCloseButton={true}
			showOkButton={true}
			showCancelButton={true}
			withOverflow={withOverflow}
			width={890}
			onOk={apply}
			okButtonDisabled={!options}
			onCancel={cancel}
		>
			<input
				id="importlogo"
				ref={importLogoRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg"
				onChange={(e) => {
					if (e.target.files && e.target.files.length > 0)
						importLogo(e.target.files[0]);
				}}
				style={{
					visibility: "hidden",
					position: "absolute",
					top: "0",
					left: "-500000px",
				}}
			/>

			<nav className="tabPages" style={{ marginTop: 0 }}>
				<div
					className={`tabPages_page ${tab === 1 ? "selected" : ""}`.trim()}
					onClick={() => setTab(1)}
				>
					<LazyImage
						src={dataIcon}
						width={20}
						height={20}
						alt="Données de la page d'accueil"
					/>
					<span>Données du projet</span>
				</div>
				{withPreview && (
					<div
						className={`tabPages_page ${tab === 2 ? "selected" : ""}`.trim()}
						onClick={() => {
							setZoom(100);
							setTab(2);
						}}
					>
						<LazyImage src={eyeIcon} width={20} height={20} alt="Aperçu" />
						<span>Aperçu</span>
					</div>
				)}
			</nav>

			<div
				className={`tabPages_page-content ${tab === 1 ? "selected" : ""}`.trim()}
				style={{ padding: 0 }}
			>
				<div className="tabPageBand">
					<div className="tabPageBandGroup">
						<div className="tabPageBandCol">
							<button
								type="button"
								style={{ height: "34px" }}
								title="Importer les données installateur"
								onClick={() => {
									document.getElementById("importdatafile").click();
								}}
							>
								<LazyImage
									src={importIcon}
									alt="Importer"
									width={18}
									height={18}
								/>
								<span>Importer</span>
							</button>
							<button
								type="button"
								style={{ height: "34px" }}
								title="Exporter les données installateur"
								onClick={() => {
									exportData();
								}}
							>
								<LazyImage
									src={exportIcon}
									alt="Exporter"
									width={18}
									height={18}
								/>
								<span>Exporter</span>
							</button>
						</div>
					</div>
					<div className="tabPageBandGroup">
						<div className="tabPageBandCol">
							<button
								type="button"
								style={{ height: "34px" }}
								title="Réinitialiser"
								onClick={() => {
									if (
										confirm(
											"Êtes-vous certain de vouloir remettre les paramètres par défaut ? Vous ne pourrez pas revenir en arrière.",
										)
									) {
										resetOptions();
									}
								}}
							>
								<LazyImage
									src={clearIcon}
									alt="Défaut"
									width={18}
									height={18}
								/>
							</button>
						</div>
					</div>
				</div>

				<div
					className="data-grid"
					style={{
						marginInline: "1.5rem",
						marginBlock: "1.5rem",
						width: "calc(100% - 3rem)",
					}}
				>
					<div
						className="data-grid-column"
						style={{ gridRow: "span 2", background: "initial" }}
					>
						<h5>
							<span style={{ flex: 1 }}>Informations de l'installateur</span>
						</h5>
						<div className="data-grid-blocks">
							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.from?.name ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														from: {
															...(old.views?.from ?? {}),
															name: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.from?.name ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="from_name">
										<b>Dénomination / Raison sociale</b>
									</label>
								</div>
								<input
									ref={fromNameRef}
									className={
										(options?.views?.from?.name ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="text"
									name="from_name"
									id="from_name"
									value={options?.infos?.from?.name ?? ""}
									onChange={(e) => {
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												from: {
													...(old.infos?.from ?? {}),
													name: e.target.value,
												},
											},
										}));
									}}
									placeholder=""
									disabled={
										(options?.views?.from?.name ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.from?.logo ?? false}
											onChange={(e) => {
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														from: {
															...(old.views?.from ?? {}),
															logo: e.target.checked,
														},
													},
												}));
											}}
											title={
												(options?.views?.from?.logo ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="from_photo">
										<b>Logo</b>
									</label>
									{(options?.views?.from?.logo ?? false) === true && (
										<>
											<button
												type="button"
												style={{
													minHeight: "auto",
													marginLeft: "auto",
													border: 0,
													background: "none",
													padding: 0,
												}}
												title="Importer son logo"
												onClick={() => {
													document.getElementById("importlogo").click();
												}}
											>
												<LazyImage
													src={importIcon}
													alt="Importer"
													width={18}
													height={18}
												/>
											</button>
											{options?.infos?.from?.logo && (
												<>
													<button
														type="button"
														style={{
															minHeight: "auto",
															border: 0,
															background: "none",
															padding: 0,
														}}
														title="Supprimer le logo"
														onClick={() => {
															if (
																confirm(
																	"Êtes-vous certain de vouloir supprimer ce logo ?",
																)
															) {
																setOptions((old) => ({
																	...old,
																	infos: {
																		...(old.infos ?? {}),
																		from: {
																			...(old.infos?.from ?? {}),
																			logo: null,
																		},
																	},
																}));
															}
														}}
													>
														<LazyImage
															src={trashIcon}
															alt="Supprimer"
															width={18}
															height={18}
														/>
													</button>
													<button
														type="button"
														style={{
															minHeight: "auto",
															border: 0,
															background: "none",
															padding: 0,
														}}
														title="Télécharger le logo"
														onClick={() => {
															exportLogo();
														}}
													>
														<LazyImage
															src={downloadIcon}
															alt="Télécharger"
															width={18}
															height={18}
														/>
													</button>
												</>
											)}
										</>
									)}
								</div>
								{(options?.views?.from?.logo ?? false) === true && (
									<div className="data-grid-block_title">
										<div
											style={{
												width: "calc(100% - 1rem)",
												padding: "0.5rem",
												maxHeight: "160px",
												aspectRatio: "1/0.5",
												border: "1px solid darkgray",
												borderRadius: "5px",
												display: "flex",
												flexDirection: "row",
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<LazyImage
												src={(
													options?.infos?.from?.logo ?? photoOffIcon
												).trim()}
												style={{ maxWidth: "100%", maxHeight: "100%" }}
											/>
										</div>
									</div>
								)}
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.from?.siret ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														from: {
															...(old.views?.from ?? {}),
															siret: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.from?.siret ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="from_siret">
										<b>Numéro de SIRET / SIREN</b>
									</label>
									{(options?.views?.from?.siret ?? false) && (
										<LazyImage
											title="Informations"
											src={infoIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"https://annuaire-entreprises.data.gouv.fr/entreprise/" +
															encodeURIComponent(
																(options?.infos?.from?.siret ?? "")
																	.trim()
																	.replace(/\s/g, ""),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<input
									ref={fromSiretRef}
									className={
										(options?.views?.from?.siret ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="text"
									name="from_siret"
									id="from_siret"
									value={options?.infos?.from?.siret ?? ""}
									onChange={(e) => {
										setOptions((old) => {
											const o = {
												...old,
												infos: {
													...(old.infos ?? {}),
													from: {
														...(old.infos?.from ?? {}),
														siret: e.target.value,
													},
												},
											};
											return o;
										});
									}}
									placeholder=""
									disabled={
										(options?.views?.from?.siret ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.from?.postalAddress ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														from: {
															...(old.views?.from ?? {}),
															postalAddress: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.from?.postalAddress ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="from_postalAddress">
										<b>Adresse postale</b>
									</label>
									{(options?.views?.from?.postalAddress ?? false) && (
										<LazyImage
											title="Localiser"
											src={currentLocationIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"https://nominatim.openstreetmap.org/ui/search.html?q=" +
															encodeURIComponent(
																(options?.infos?.from?.postalAddress ?? "")
																	.trim()
																	.replace(/ {2}|\r\n|\n|\r/gm, " "),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<textarea
									ref={fromPostalAddressRef}
									rows={4}
									className={
										(options?.views?.from?.postalAddress ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="text"
									name="from_postalAddress"
									id="from_postalAddress"
									value={options?.infos?.from?.postalAddress ?? ""}
									onChange={(e) => {
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												from: {
													...(old.infos?.from ?? {}),
													postalAddress: e.target.value,
												},
											},
										}));
									}}
									placeholder=""
									disabled={
										(options?.views?.from?.postalAddress ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.from?.email ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														from: {
															...(old.views?.from ?? {}),
															email: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.from?.email ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="from_email">
										<b>Adresse email</b>
									</label>
									{(options?.views?.from?.email ?? false) && (
										<LazyImage
											title="Envoyer un message"
											src={sendIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"mailto:" +
															encodeURIComponent(
																(options?.infos?.from?.email ?? "").trim(),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<input
									ref={fromEmailRef}
									className={
										(options?.views?.from?.email ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="email"
									name="from_email"
									id="from_email"
									value={options?.infos?.from?.email ?? ""}
									onChange={(e) => {
										setOptions((old) => {
											const o = {
												...old,
												infos: {
													...(old.infos ?? {}),
													from: {
														...(old.infos?.from ?? {}),
														email: e.target.value,
													},
												},
											};
											return o;
										});
									}}
									placeholder=""
									disabled={
										(options?.views?.from?.email ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.from?.phone ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														from: {
															...(old.views?.from ?? {}),
															phone: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.from?.phone ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="from_phone">
										<b>Numéro de téléphone</b>
									</label>
									{(options?.views?.from?.phone ?? false) && (
										<LazyImage
											title="Appeler"
											src={callIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"tel:" +
															encodeURIComponent(
																(options?.infos?.from?.phone ?? "").trim(),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<input
									ref={fromPhoneRef}
									className={
										(options?.views?.from?.phone ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="tel"
									name="from_phone"
									id="from_phone"
									value={options?.infos?.from?.phone ?? ""}
									onChange={(e) => {
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												from: {
													...(old.infos?.from ?? {}),
													phone: e.target.value,
												},
											},
										}));
									}}
									placeholder=""
									disabled={
										(options?.views?.from?.phone ?? false) === false &&
										withViewSelector
									}
								/>
							</div>
						</div>
					</div>

					<div className="data-grid-column" style={{ background: "initial" }}>
						<h5>
							<span>Données relatives au client</span>
						</h5>
						<div className="data-grid-blocks">
							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.to?.name ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														to: {
															...(old.views?.to ?? {}),
															name: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.to?.name ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="to_name">
										<b>Nom du client</b>
									</label>
								</div>
								<input
									ref={toNameRef}
									className={
										(options?.views?.to?.name ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="text"
									name="to_name"
									id="to_name"
									value={options?.infos?.to?.name ?? ""}
									onChange={(e) => {
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												to: {
													...(old.infos?.to ?? {}),
													name: e.target.value,
												},
											},
										}));
									}}
									placeholder=""
									disabled={
										(options?.views?.to?.name ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.to?.postalAddress ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														to: {
															...(old.views?.to ?? {}),
															postalAddress: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.to?.postalAddress ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="to_postalAddress">
										<b>Adresse postale</b>
									</label>
									{(options?.views?.to?.postalAddress ?? false) && (
										<LazyImage
											title="Localiser"
											src={currentLocationIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"https://nominatim.openstreetmap.org/ui/search.html?q=" +
															encodeURIComponent(
																(options?.infos?.to?.postalAddress ?? "")
																	.trim()
																	.replace(/ {2}|\r\n|\n|\r/gm, " "),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<textarea
									ref={toPostalAddressRef}
									rows={4}
									className={
										(options?.views?.to?.postalAddress ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="text"
									name="to_postalAddress"
									id="to_postalAddress"
									value={options?.infos?.to?.postalAddress ?? ""}
									onChange={(e) => {
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												to: {
													...(old.infos?.to ?? {}),
													postalAddress: e.target.value,
												},
											},
										}));
									}}
									placeholder=""
									disabled={
										(options?.views?.to?.postalAddress ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.to?.email ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														to: {
															...(old.views?.to ?? {}),
															email: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.to?.email ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="to_email">
										<b>Adresse email</b>
									</label>
									{(options?.views?.to?.email ?? false) && (
										<LazyImage
											title="Envoyer un message"
											src={sendIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"mailto:" +
															encodeURIComponent(
																(options?.infos?.to?.email ?? "").trim(),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<input
									ref={toEmailRef}
									className={
										(options?.views?.to?.email ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="email"
									name="to_email"
									id="to_email"
									value={options?.infos?.to?.email ?? ""}
									onChange={(e) =>
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												to: {
													...(old.infos?.to ?? {}),
													email: e.target.value,
												},
											},
										}))
									}
									placeholder=""
									disabled={
										(options?.views?.to?.email ?? false) === false &&
										withViewSelector
									}
								/>
							</div>

							<div className="data-grid-block">
								<div className="data-grid-block_title">
									{withViewSelector && (
										<input
											type="checkbox"
											checked={options?.views?.to?.phone ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														to: {
															...(old.views?.to ?? {}),
															phone: e.target.checked,
														},
													},
												}))
											}
											title={
												(options?.views?.to?.phone ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
									)}
									<label htmlFor="to_phone">
										<b>Numéro de téléphone</b>
									</label>
									{(options?.views?.to?.phone ?? false) && (
										<LazyImage
											title="Appeler"
											src={callIcon}
											width={16}
											height={16}
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() =>
												window
													.open(
														"tel:" +
															encodeURIComponent(
																(options?.infos?.to?.phone ?? "").trim(),
															),
														"_blank",
													)
													.focus()
											}
										/>
									)}
								</div>
								<input
									ref={toPhoneRef}
									className={
										(options?.views?.to?.phone ?? false) === false &&
										withViewSelector
											? "disabled"
											: ""
									}
									type="tel"
									name="to_phone"
									id="to_phone"
									value={options?.infos?.to?.phone ?? ""}
									onChange={(e) => {
										setOptions((old) => ({
											...old,
											infos: {
												...(old.infos ?? {}),
												to: {
													...(old.infos?.to ?? {}),
													phone: e.target.value,
												},
											},
										}));
									}}
									placeholder=""
									disabled={
										(options?.views?.to?.phone ?? false) === false &&
										withViewSelector
									}
								/>
							</div>
						</div>
					</div>

					{withViewSelector && (
						<div className="data-grid-column" style={{ background: "initial" }}>
							<h5>
								<span>Données diverses</span>
							</h5>
							<div className="data-grid-blocks" style={{ gap: "0.5rem" }}>
								<div className="data-grid-block">
									<div className="data-grid-block_title">
										<input
											type="checkbox"
											checked={options?.views?.projectName ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														projectName: e.target.checked,
													},
												}))
											}
											title={
												(options?.views?.projectName ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
										<label htmlFor="to_name" style={{ fontSize: "90%" }}>
											Afficher le nom du projet
										</label>
									</div>
								</div>

								<div className="data-grid-block">
									<div className="data-grid-block_title">
										<input
											type="checkbox"
											checked={options?.views?.projectVersion ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														projectVersion: e.target.checked,
													},
												}))
											}
											title={
												(options?.views?.projectVersion ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
										<label htmlFor="to_name" style={{ fontSize: "90%" }}>
											Afficher la version du projet
										</label>
									</div>
								</div>

								<div className="data-grid-block">
									<div className="data-grid-block_title">
										<input
											type="checkbox"
											checked={options?.views?.projectCreated ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														projectCreated: e.target.checked,
													},
												}))
											}
											title={
												(options?.views?.projectCreated ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
										<label htmlFor="to_name" style={{ fontSize: "90%" }}>
											Afficher la date de création
										</label>
									</div>
								</div>

								<div className="data-grid-block">
									<div className="data-grid-block_title">
										<input
											type="checkbox"
											checked={options?.views?.projectUpdated ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														projectUpdated: e.target.checked,
													},
												}))
											}
											title={
												(options?.views?.projectUpdated ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
										<label htmlFor="to_name" style={{ fontSize: "90%" }}>
											Afficher la date de dernière modification
										</label>
									</div>
								</div>

								<div className="data-grid-block">
									<div className="data-grid-block_title">
										<input
											type="checkbox"
											checked={options?.views?.projectType ?? false}
											onChange={(e) =>
												setOptions((old) => ({
													...old,
													views: {
														...(old.views ?? {}),
														projectType: e.target.checked,
													},
												}))
											}
											title={
												(options?.views?.projectType ?? false) === true
													? "Masquer cet élément"
													: "Afficher cet élément"
											}
										/>
										<label htmlFor="to_name" style={{ fontSize: "90%" }}>
											Afficher le type de l'installation
										</label>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{withPreview && (
				<div
					className={`tabPages_page-content ${tab === 2 ? "selected" : ""}`.trim()}
					style={{ background: "#F9F9F9", padding: 0 }}
				>
					<div className="tabPageBand">
						<div className="tabPageBandGroup">
							<div className="tabPageBandCol">
								<button
									type="button"
									style={{ height: "34px" }}
									title="Plus petit"
									onClick={() => {
										setZoom((old) => {
											const o = parseInt(old, 10) - 25;
											if (o < 25) return parseInt(old, 10);
											return o;
										});
									}}
									disabled={zoom <= 25}
								>
									<LazyImage
										src={zoomOutIcon}
										alt="Zoom moins"
										width={22}
										height={22}
									/>
								</button>
								<select
									value={zoom}
									onChange={(e) => {
										setZoom(parseInt(e.target.value, 10));
									}}
									style={{
										maxWidth: "100%",
										width: "100px",
										overflowX: "hidden",
										whiteSpace: "nowrap",
										textOverflow: "ellipsis",
										textAlign: "center",
									}}
								>
									{Array(4)
										.fill()
										.map((_, i) => (
											<option value={(i + 1) * 2.5 * 10} key={i}>
												{(i + 1) * 2.5 * 10}%
											</option>
										))}
								</select>
								<button
									type="button"
									style={{ height: "34px" }}
									title="Taille réelle"
									onClick={() => setZoom(100)}
									disabled={zoom === 100}
								>
									<LazyImage
										src={zoomRealIcon}
										alt="Taille réelle"
										width={22}
										height={22}
									/>
								</button>
								<button
									type="button"
									style={{ height: "34px" }}
									title="Plus grand"
									onClick={() => {
										setZoom((old) => {
											const o = parseInt(old, 10) + 25;
											if (o > 100) return parseInt(old, 10);
											return o;
										});
									}}
									disabled={zoom >= 100}
								>
									<LazyImage
										src={zoomInIcon}
										alt="Zoom plus"
										width={22}
										height={22}
									/>
								</button>
							</div>
						</div>
					</div>

					<div className="fppage-scale-container">
						<div
							className="fppage-container"
							data-zoom={zoom}
							style={{
								width: `calc((var(--paper-size-w) + (var(--padding-inline) / 2)) * ${zoom / 100})`,
								height: `calc((var(--paper-size-h) + (var(--padding-inline) / 2)) * ${zoom / 100})`,
							}}
						>
							<div
								className="fppage"
								style={{ transform: `scale(${zoom / 100})` }}
							>
								<div
									className="fppage-header"
									data-margin-top={`tiquettes.fr ${pkg.version}`}
								>
									Tableau électrique
								</div>

								<div
									className="ffpage-box"
									style={{
										left: "10mm",
										top: "55mm",
										width: "calc(210mm - 20mm)",
										height: "60mm",
									}}
								>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "1mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Installateur
									</span>

									{(options?.views?.from?.logo ?? false) === true &&
										options?.infos?.from?.logo && (
											<div
												className="ffpage-item"
												style={{
													left: "11mm",
													top: "12mm",
													width: "30mm",
													height: "30mm",
													display: "grid",
													placeItems: "center",
												}}
											>
												<LazyImage
													src={options?.infos?.from?.logo}
													style={{
														maxWidth: "100%",
													}}
												/>
											</div>
										)}

									{(options?.views?.from?.siret ?? false) === true &&
										typeof options?.infos?.from?.siret === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "8mm",
													top: "50mm",
													width: "150px",
													fontSize: "10pt",
												}}
											>
												S / {options?.infos?.from?.siret}
											</span>
										)}

									{(options?.views?.from?.name ?? false) === true &&
										typeof options?.infos?.from?.name === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "65mm",
													top: "6mm",
													width: "115mm",
													fontSize: "16pt",
													fontWeight: "bold",
												}}
											>
												{options?.infos?.from?.name}
											</span>
										)}

									{(options?.views?.from?.postalAddress ?? false) === true &&
										typeof options?.infos?.from?.postalAddress === "string" && (
											<span
												className="ffpage-item"
												style={{
													wordWrap: "break-word",
													whiteSpace: "pre-wrap",
													left: "65mm",
													top: "15mm",
													width: "115mm",
													height: "25mm",
													fontSize: "12pt",
												}}
											>
												{options?.infos?.from?.postalAddress}
											</span>
										)}

									{(options?.views?.from?.email ?? false) === true &&
										typeof options?.infos?.from?.email === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "65mm",
													top: "42mm",
													width: "115mm",
													fontSize: "12pt",
												}}
											>
												Email: {options?.infos?.from?.email}
											</span>
										)}

									{(options?.views?.from?.phone ?? false) === true &&
										typeof options?.infos?.from?.phone === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "65mm",
													top: "49mm",
													width: "115mm",
													fontSize: "12pt",
												}}
											>
												Téléphone: {options?.infos?.from?.phone}
											</span>
										)}
								</div>

								<div
									className="ffpage-box"
									style={{
										left: "10mm",
										top: "120mm",
										width: "calc(210mm - 20mm)",
										height: "60mm",
									}}
								>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "1mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Client
									</span>

									<LazyImage
										className="ffpage-item"
										style={{
											left: "11mm",
											top: "12mm",
											width: "30mm",
											height: "30mm",
										}}
										src={"./android-chrome-192x192.png"}
										width={114}
										height={114}
									/>

									<span
										className="ffpage-item"
										style={{
											left: "11mm",
											top: "48mm",
											width: "150px",
											fontSize: "10pt",
										}}
									>
										Dossier réalisé avec
									</span>
									<span
										className="ffpage-item"
										style={{
											left: "11mm",
											top: "52mm",
											width: "150px",
											fontSize: "10pt",
										}}
									>
										<b>Tiquettes.fr {pkg.version}</b>
									</span>

									{(options?.views?.to?.name ?? false) === true &&
										typeof options?.infos?.to?.name === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "65mm",
													top: "6mm",
													width: "115mm",
													fontSize: "16pt",
													fontWeight: "bold",
												}}
											>
												{options?.infos?.to?.name}
											</span>
										)}

									{(options?.views?.to?.postalAddress ?? false) === true &&
										typeof options?.infos?.to?.postalAddress === "string" && (
											<span
												className="ffpage-item"
												style={{
													wordWrap: "break-word",
													whiteSpace: "pre-wrap",
													left: "65mm",
													top: "15mm",
													width: "115mm",
													height: "25mm",
													fontSize: "12pt",
												}}
											>
												{options?.infos?.to?.postalAddress}
											</span>
										)}

									{(options?.views?.to?.email ?? false) === true &&
										typeof options?.infos?.to?.email === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "65mm",
													top: "42mm",
													width: "115mm",
													fontSize: "12pt",
												}}
											>
												Email: {options?.infos?.to?.email}
											</span>
										)}

									{(options?.views?.to?.phone ?? false) === true &&
										typeof options?.infos?.to?.phone === "string" && (
											<span
												className="ffpage-item"
												style={{
													left: "65mm",
													top: "49mm",
													width: "115mm",
													fontSize: "12pt",
												}}
											>
												Téléphone: {options?.infos?.to?.phone}
											</span>
										)}
								</div>

								<div
									className="ffpage-box"
									style={{
										left: "10mm",
										top: "185mm",
										width: "calc(210mm - 20mm)",
										height: "100mm",
									}}
								>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "1mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Nom du projet
									</span>
									{(options?.views?.projectName ?? false) === true && (
										<span
											className="ffpage-item"
											style={{
												left: "8mm",
												top: "9mm",
												width: "175mm",
												fontSize: "14pt",
											}}
										>
											<b>{switchboard.prjname}</b>
										</span>
									)}
									<div
										className="ffpage-line"
										style={{
											left: 0,
											top: "35mm",
											width: "190mm",
										}}
									></div>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "38.7mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Révision
									</span>
									{(options?.views?.projectVersion ?? false) === true && (
										<>
											<span
												className="ffpage-item"
												style={{
													left: "40mm",
													top: "38mm",
													fontSize: "15pt",
												}}
											>
												<b>{switchboard.prjversion}</b>
											</span>
											<span
												className="ffpage-item"
												style={{
													left: "60mm",
													top: "39mm",
													fontSize: "10pt",
												}}
											>
												{switchboard.appversion}
											</span>
										</>
									)}
									<div
										className="ffpage-line"
										style={{
											left: 0,
											top: "46mm",
											width: "190mm",
										}}
									></div>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "48.7mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Date de création
									</span>
									{(options?.views?.projectCreated ?? false) === true && (
										<span
											className="ffpage-item"
											style={{
												left: "40mm",
												top: "48mm",
												fontSize: "15pt",
											}}
										>
											<b>{switchboard.prjcreated.toLocaleDateString()}</b>
										</span>
									)}
									<span
										className="ffpage-item"
										style={{
											left: "95mm",
											top: "48.7mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Dernière modification
									</span>
									{(options?.views?.projectUpdated ?? false) === true && (
										<span
											className="ffpage-item"
											style={{
												left: "140mm",
												top: "48mm",
												fontSize: "15pt",
											}}
										>
											<b>{switchboard.prjupdated.toLocaleDateString()}</b>
										</span>
									)}
									<div
										className="ffpage-line"
										style={{
											left: 0,
											top: "56mm",
											width: "190mm",
										}}
									></div>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "58.7mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Type d'installation
									</span>
									{(options?.views?.projectType ?? false) === true && (
										<span
											className="ffpage-item"
											style={{
												left: "40mm",
												top: "58mm",
												fontSize: "15pt",
											}}
										>
											<b>
												{switchboard.projectType === "R"
													? "Résidentiel"
													: switchboard.projectType === "T"
														? "Tertiaire"
														: ""}
											</b>
										</span>
									)}
									<div
										className="ffpage-line"
										style={{
											left: 0,
											top: "66mm",
											width: "190mm",
										}}
									></div>
									<span
										className="ffpage-item"
										style={{
											left: "2mm",
											top: "68mm",
											fontSize: "10pt",
											color: "var(--primary-color)",
										}}
									>
										Ce dossier contient
									</span>
									<span
										className="ffpage-item"
										style={{
											left: "8mm",
											top: "78mm",
											fontSize: "14pt",
										}}
									>
										<b>{printOptions.schema ? "☑" : "☐"} Schéma unifilaire</b>
									</span>
									<span
										className="ffpage-item"
										style={{
											left: "8mm",
											top: "86mm",
											fontSize: "14pt",
										}}
									>
										<b>{printOptions.summary ? "☑" : "☐"} Nomenclature</b>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<input
				id="importdatafile"
				ref={importRef}
				type="file"
				onChange={(e) => {
					if (e.target.files && e.target.files.length > 0)
						importData(e.target.files[0]);
				}}
				style={{
					visibility: "hidden",
					position: "absolute",
					top: "0",
					left: "-500000px",
				}}
			/>
		</Popup>
	);
}
