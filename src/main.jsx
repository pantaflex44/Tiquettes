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

import "./others/arrayExtends.js";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import * as semver from "semver";

import App from "./App.jsx";

import "./css/main.css";

import * as pkg from "../package.json" with { type: "json" };
import { statsPush } from "../public/api/stats.js";
import NewVersionPopup from "./components/NewVersionPopup.jsx";

function Footer() {
	return (
		<div
			style={{
				marginTop: "1em",
				fontSize: "small",
				color: "darkgray",
			}}
			className="footer"
		>
			{pkg.title} {pkg.version} {/*import.meta.env.VITE_APP_MODE && "(DEV)"*/}
			<span className="not_printable">
				{" "}
				|{" "}
				<a
					href={pkg.repository.url}
					style={{ color: "var(--primary-color)" }}
					target="_blank"
					rel="noopener"
				>
					{pkg.repository.url}
				</a>{" "}
				|{" "}
				<a
					href="https://www.gnu.org/licenses/agpl-3.0.fr.html"
					style={{ color: "var(--primary-color)" }}
					target="_blank"
					rel="noopener"
				>{`Licence ${pkg.license}`}</a>{" "}
				|{" "}
				<a
					href="https://pantaflex44.github.io/Portfolio/"
					style={{ color: "var(--primary-color)" }}
					target="_blank"
					rel="noopener"
				>
					{pkg.author} (pantaflex44)
				</a>{" "}
				| &copy; 2024-{new Date().getFullYear()}
			</span>
		</div>
	);
}

export default function Main() {
	const [newVersionAvaillable, setNewVersionAvaillable] = useState(null);
	const [statsSended, setStatsSended] = useState(false);

	const imagesPreloader = () => {
		return [
			"schema_1P+N",
			"schema_2P",
			"schema_3P",
			"schema_3P+N",
			"schema_4P",
			"schema_blank",
			"schema_bpnf",
			"schema_bpno",
			"schema_c",
			"schema_cc",
			"schema_cnf",
			"schema_cno",
			"schema_cpt",
			"schema_dd",
			"schema_fus",
			"schema_i",
			"schema_id",
			"schema_k",
			"schema_k_nc",
			"schema_kc",
			"schema_led",
			"schema_o",
			"schema_pc",
			"schema_prd",
			"schema_q",
			"schema_son",
			"schema_sw",
			"schema_telec",
			"schema_trf",
			"schema_warning",
			"swb_alim",
			"swb_alim_eco",
			"swb_alim_ht",
			"swb_battery",
			"swb_bec",
			"swb_bell",
			"swb_blank",
			"swb_blrgas",
			"swb_calendar-clock",
			"swb_chauffage",
			"swb_clim",
			"swb_clock",
			"swb_coffeetea",
			"swb_contact",
			"swb_cuissin",
			"swb_differential-circuit-breaker",
			"swb_dryer",
			"swb_eau",
			"swb_ecl",
			"swb_ecl_cmd",
			"swb_ecl_rgb",
			"swb_ecl2",
			"swb_eclext",
			"swb_electric-motor",
			"swb_ermt",
			"swb_ext",
			"swb_fire",
			"swb_fountain",
			"swb_four",
			"swb_frigo",
			"swb_froid",
			"swb_garage",
			"swb_gaz",
			"swb_grid",
			"swb_ground",
			"swb_home",
			"swb_homeshield",
			"swb_iceberg",
			"swb_induction",
			"swb_informatique",
			"swb_inverter",
			"swb_ironing",
			"swb_journuit",
			"swb_lg",
			"swb_ll",
			"swb_lv",
			"swb_microonde",
			"swb_minuterie",
			"swb_music",
			"swb_pc",
			"swb_pc_kitchen",
			"swb_pc2",
			"swb_pctri",
			"swb_pompe1",
			"swb_pool",
			"swb_portail",
			"swb_puissance",
			"swb_remswitch",
			"swb_ship",
			"swb_smoke",
			"swb_solaire",
			"swb_solchauffant",
			"swb_soup",
			"swb_spa",
			"swb_split",
			"swb_store",
			"swb_surgeprotector",
			"swb_telec",
			"swb_telephonie",
			"swb_thermo",
			"swb_thermo2",
			"swb_thermo3",
			"swb_thermo4",
			"swb_transformer",
			"swb_tv",
			"swb_twldryer",
			"swb_ventil",
			"swb_ventil2",
			"swb_vmc",
			"swb_voitureelectrique",
			"swb_voitureelectrique2",
			"swb_volet",
			"doc",
			"src",
			"license",
			"changelog",
			"brand-facebook",
			"partners",
			"ressources",
		].map((src) => {
			return new Promise((resolve, reject) => {
				const s = `${import.meta.env.VITE_APP_URL}${src}.svg`;
				const img = new Image();
				img.onload = () => {
					resolve(img);
				};
				img.onerror = img.onabort = () => {
					reject(s);
				};
				img.src = s;
			});
		});
	};

	useEffect(() => {
		console.log("Mode:", import.meta.env.VITE_APP_MODE);

		console.log("Preloading images...");
		Promise.all(imagesPreloader())
			.then(() => {
				console.log("All images preloaded.");
			})
			.catch((err) => {
				console.error("Error preloading image: ", err);
			});

		//if (import.meta.env.VITE_APP_MODE !== "development") {
		const defaultUrl = "https://www.tiquettes.fr/app/?enjoy";

		const domains = ["tiquettes.fr", "www.tiquettes.fr"];
		const pathes = [
			"/app/",
			"/app/infos.json",
			"/api/",
			"/api/stats_read.php",
			"/app/api/stats_read.php",
			"/dev/",
		];

		const origins = [];
		domains.forEach((domain) => {
			const o = `https://${domain}`;
			origins.push(o);
			pathes.forEach((path) => {
				const k = `${o}${path}`;
				origins.push(k);
			});
		});
		origins.push(`http://localhost:${import.meta.env.VITE_SERVER_PORT}`);
		origins.push(`https://localhost:${import.meta.env.VITE_SERVER_PORT}`);

		const origin = window.location.origin.split("?")[0].toLowerCase().trim();
		if (!origins.includes(origin)) window.location.replace(defaultUrl);
		//}

		fetch(`./infos.json?t=${Date.now()}`, {
			method: "GET",
			cache: "no-store",
			headers: {
				Pragma: "no-cache",
				"Cache-Control": "no-cache",
			},
		})
			.then((response) => response.json())
			.then((json) => {
				const currentVersion = json.version ?? "0.0.0";
				const localVersion = pkg.version;

				if (semver.gt(currentVersion, localVersion)) {
					console.log(
						`New version ${currentVersion} availlable ! Please force your browser to reload before using it.`,
					);
					setNewVersionAvaillable(currentVersion);
				} else {
					console.log(`You are up to date. Current version: ${currentVersion}`);
				}
			})
			.catch((error) =>
				console.error("Unable to verify app version : ", error),
			);

		if (!statsSended) {
			setStatsSended(() => {
				statsPush("choice", "referer", [document.referer ?? "Direct"]);
				statsPush("user_agent");
				statsPush("screen_size");
				statsPush("screen_type");
				statsPush("device_type");
				statsPush("os");
				statsPush("browser");
				return true;
			});
		}
	}, []);

	return (
		<>
			<App />
			<Footer />

			{newVersionAvaillable && (
				<NewVersionPopup
					newVersion={newVersionAvaillable}
					onOk={() => {
						window.location.reload(true);
					}}
				/>
			)}
		</>
	);
}

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
