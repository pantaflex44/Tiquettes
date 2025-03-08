/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2025 Christophe LEMOINE

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

/* eslint-disable react/prop-types */

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import SchemaItem from "./SchemaItem.jsx";

import * as pkg from '../package.json';
import swbIcons from './switchboard_icons.json';

import monitorIcon from './assets/monitor.svg';
import nomonitorIcon from './assets/nomonitor.svg';
import boltIcon from './assets/bolt.svg';
import noboltIcon from './assets/nobolt.svg';
import groundIcon from './assets/ground.svg';
import nogroundIcon from './assets/noground.svg';
import homeIcon from "./assets/home.svg";
import compagnyIcon from "./assets/compagny.svg";
import info2Icon from "./assets/info2.svg";
import cancelIcon from "./assets/cancel.svg";
import numbersIcon from "./assets/numbers.svg";

export default function SchemaTab({
                                      tab,
                                      switchboard,
                                      setSwitchboard,
                                      printOptions,
                                      schemaFunctions,
                                      reassignModules,
                                      onEditSymbol = null,
                                  }) {
    const [monitorOpened, setMonitorOpened] = useState(false);
    const monitorRef = useRef(null);
    let dbCurrent = 0;

    useEffect(() => {
        if (monitorOpened) monitorRef.current.focus();
    }, [monitorOpened]);

    const getModuleById = (moduleId) => {
        let indexes = {row: -1, module: -1};
        let m = {module: null, indexes};

        switchboard.rows.forEach((row, ri) => {
            row.forEach((module, mi) => {
                if (!m.module && module.id === moduleId && !module.free) {
                    m = {...m, module, indexes: {...indexes, row: ri, module: mi}};
                }
            })
        });

        return m;
    }

    const handleEditSymbol = (module) => {
        const m = getModuleById(module.id);
        if (!m?.module) return;

        onEditSymbol(m.indexes.row, m.indexes.module);
    }

    const head = useMemo(() => {
        return switchboard.rows.map((row) => row.map((module) => {
            if ((module.func ?? '').trim() !== '' && ((module.parentId ?? '-').trim() === '' || !getModuleById(module.parentId).module)) {
                return ({...module, parentId: switchboard.withDB ? "DB" : ""});
            }
        })).flat().filter((module) => module);
    }, [switchboard.rows, switchboard.withDb]);

    const getChilds = useCallback((parentId) => {
        return switchboard.rows.map((row) => row.map((module) => {
            if ((module.func ?? '').trim() !== '' && module.parentId === parentId) {
                return module;
            }
        })).flat().filter((module) => module);
    }, [switchboard.rows, switchboard.withDb]);

    const getRow = useCallback((moduleList) => {
                let l = {};
                moduleList.forEach((module, i) => {
                    let _childs = getChilds(module.id);

                    const kcId = (module.kcId ?? "");
                    const kcModule = getModuleById(kcId).module;
                    if (kcModule) {
                        _childs.unshift({
                            ...kcModule,
                            kcId: '',
                            /*id: `${kcModule.id}_${module.id}`,*/
                            parentId: module.id,
                            func: 'k',
                            icon: module.icon,
                            text: module.text,
                            desc: module.desc,
                            pole: module.pole
                        })
                    }

                    const childs = getRow(_childs);

                    l[module.id] = {
                        module,
                        childs,
                        isLast: Object.keys(childs).length === 0,
                        hasPrev: i > 0,
                        hasNext: i < moduleList.length - 1,
                        hasBrothers: Object.keys(getChilds(module.parentId) ?? {}).length > 0,
                    };
                })
                return l;
            }
            ,
            [switchboard.rows, switchboard.withDb]
        )
    ;

    const tree = useMemo(() => switchboard.withDb
            ? ({
                childs: ({
                    "DB": {
                        module: {...switchboard.db},
                        hasNext: false,
                        hasPrev: false,
                        isLast: false,
                        childs: getRow(head),
                        hasBrothers: false
                    }
                })
            })
            : ({
                childs: getRow(head)
            }),
        [head, switchboard.withDb, switchboard.db]
    );

    const monitor = useMemo(() => {
        if (!switchboard.schemaMonitor) return {};

        let result = {};
        let nbIdTypeA30 = 0;
        let nbIdTypeAC30 = 0;

        function add_error(id, message) {
            let errors = (result.errors ?? [])[id] ?? [];
            if (!errors.includes(message)) errors.push(message);
            if (errors.length > 0) result = {...result, errors: {...result.errors, [id]: errors}};
        }

        function add_info(id, message) {
            let infos = (result.infos ?? [])[id] ?? [];
            if (!infos.includes(message)) infos.push(message);
            if (infos.length > 0) result = {...result, infos: {...result.infos, [id]: infos}};
        }

        function monitor_runtime(childs, lastParentModule = null, lastParentModuleId = null) {
            let _lastParentModuleId = lastParentModuleId;

            Object.entries(childs).forEach(([id, data]) => {
                    const isTri = (pole) => pole === "3P" || pole === "4P" || pole === "3P+N";
                    const isTetra = (pole) => pole === "4P" || pole === "3P+N";
                    const isMono = (pole) => pole === "1P+N";

                    const getCurrent = (module) => {
                        const _currentCurrent = (module?.current ?? "0A").split('/');
                        if (_currentCurrent.length > 0) return parseInt(_currentCurrent[_currentCurrent.length - 1].replace(/\D/g, ''));
                        return 0;
                    };

                    const getFunc = (module) => {
                        return module?.func;
                    }

                    const getSensibility = (module) => {
                        return parseInt((module?.sensibility ?? '0').replace(/\D/g, ''));
                    }

                    const getType = (module) => {
                        return (module?.type ?? '').toUpperCase();
                    }

                    const getId = (module) => {
                        return module?.id;
                    }

                    const getPole = (module) => {
                        return module?.pole;
                    }

                    const getTrueCoef = (module) => {
                        return switchboard.projectType === 'R' && isMono(currentPole) ? Math.round((module?.coef ?? 0.5) * 10) / 10 : 1;
                    }

                    const getTrueFactor = (module) => {
                        return (module?.pole ?? '') === '3P' ? Math.sqrt(3) : 1
                    }

                    const getIconDetails = (module) => {
                        const icon = module?.icon ?? '';
                        const found = swbIcons.filter((i) => i.filename === icon);
                        return found.length === 1 ? found[0] : null;
                    }

                    const applyPowerRound = (value) => {
                        if (value >= 1000) return {value: Math.round((value / 1000) * 100) / 100, unit: 'kW'};
                        if (value >= 1000000) return {value: Math.round((value / 1000000) * 100) / 100, unit: 'm.W'};
                        return {value, unit: 'W'};
                    }

                    const parentPole = lastParentModule?.pole ?? (switchboard.withDb ? switchboard.db?.pole : null);
                    const currentPole = getPole(data.module);
                    const currentFunc = getFunc(data.module);
                    const currentCurrent = getCurrent(data.module);
                    const currentPower = currentCurrent * switchboard.vref;
                    const vDivider = switchboard.vref * (isTri(currentPole) ? 3 : (isMono(currentPole) ? 1 : 1));


                    // Le module courant est un disjoncteur de branchement
                    if (currentFunc === 'db') {
                        dbCurrent = currentCurrent;

                        add_info(id, `Calibre retenu: ${dbCurrent}A`);

                        Object.entries(data.childs).forEach(([cid, cdata]) => {
                            if (getFunc(cdata.module) === 'sw') {
                                const childCurrent = getCurrent(cdata.module);
                                if (childCurrent < currentCurrent) add_error(cid, `Le calibre choisi (${childCurrent}A) doit être supérieur au calibre maximum du disjoncteur de branchement: ${currentCurrent}A`);
                            }
                        });
                    }

                    // Le module courant est un interrupteur différentiel
                    if (currentFunc === 'id' && getId(data.module)) {
                        const powers = Object.entries(data.childs).map(([_, cdata]) => {
                            if (getFunc(cdata.module) === 'q') return ((getCurrent(cdata.module) * getTrueCoef(cdata.module)) / getTrueFactor(cdata.module)) * switchboard.vref;
                            return 0;
                        });
                        const total = Math.ceil((powers.reduce((partialSum, a) => partialSum + a, 0)) / vDivider);

                        if (total > currentCurrent) { // erreur seulement si la charge > DDR (regle de l'aval - DDR >= total charges)
                            if (dbCurrent <= 0 || currentCurrent < dbCurrent) { // et seulement si le DDR < AGCP (règle de l'amont - DDR >= AGCP):
                                add_error(id, `La charge retenue (${total}A) est supérieure à la limite définie: ${currentCurrent}A`);
                            }
                        }

                        if (Object.keys(data.childs).length > 8) add_error(id, `La norme NFC 15-100 autorise un maximum de 8 circuits par interrupteur différentiel.`);

                        if (switchboard.projectType === 'R') {
                            const sensibility = getSensibility(data.module);
                            if (getType(data.module) === 'A' && sensibility === 30) nbIdTypeA30++;
                            if (getType(data.module) === 'AC' && sensibility === 30) nbIdTypeAC30++;
                        }

                        add_info(id, `Charge retenue: ${total}A sur un maximum autorisé de ${currentCurrent}A`);

                        _lastParentModuleId = data.module;
                    }

                    // Le module courant est un disjoncteur
                    if (currentFunc === 'q' && getId(data.module)) {
                        const powerDetails = applyPowerRound(currentPower * (isTetra(data.module) ? 3 : 1));
                        add_info(id, `Puissance maximum admissible: ${powerDetails.value}${powerDetails.unit}`);

                        const iconDetails = getIconDetails(data.module);
                        if (iconDetails && iconDetails.requiredIdTypes) {
                            if (!iconDetails.requiredIdTypes.includes(_lastParentModuleId?.type ?? '')) {
                                const _parentType = (_lastParentModuleId?.type ?? '').trim();
                                const _hasParentType = _parentType !== '';

                                add_error(id, `Ce départ doit être couvert par une protection différentielle de type: ${iconDetails.requiredIdTypes.join(', ')}. ${_hasParentType ? `Type actuel: ${_parentType}` : `Protection différentielle incompatible.`}`)
                            }
                        }
                    }

                    // Vérification du câblage du module courant (cohérence des pôles)
                    if (currentPole && parentPole && (
                        (parentPole === '1P+N' && currentPole !== '1P+N')
                        || (parentPole === '3P' && currentPole !== '3P')
                        || ((parentPole === '1P+N' || parentPole === '3P') && (currentPole === '4P' || currentPole === '3P+N'))
                    )) {
                        add_error(id, `Câblage incohérent. Le nombre de pôles du module parent (${lastParentModule.id}: ${parentPole}) ne permet pas de câbler correctement ce module (${currentPole}).`);
                    }

                    // Pour finir, on passe aux modules enfants
                    monitor_runtime(data.childs, data.module, _lastParentModuleId);
                }
            );
        }

        monitor_runtime(tree.childs);

        // Dans un projet résidentiel, on vérifie le nombre d'interrupteurs différentiels obligatoire
        if (switchboard.projectType === 'R' && (nbIdTypeA30 + nbIdTypeAC30) < 2) {
            add_error('Global', `Une installation électrique résidentielle doit être protégée par au moins 2 interrupteurs différentiels de sensibilité: 30mA.`);
        }

        return result;
    }, [tree?.childs, switchboard.schemaMonitor, switchboard.projectType, switchboard.vref]);
    const monitorWarningsLength = useMemo(() => Object.values(monitor.errors ?? {}).map((e) => e.flat()).length, [monitor]);

    return (
        <div
            className={`schema ${tab === 2 ? 'selected' : ''} ${printOptions.schema ? 'printable' : 'notprintable'}`.trim()}>
            <div className="tabPageBand notprintable">
                <div className="tabPageBandGroup">
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="schemaProjectTypeR" id="schemaProjectTypeR"
                               checked={switchboard.projectType === "R"}
                               onChange={() => setSwitchboard((old) => ({...old, projectType: "R"}))}/>
                        <label htmlFor="schemaProjectTypeR" title="Project résidentiel">
                            <img src={homeIcon} alt="Project résidentiel" width={24} height={24}/>
                        </label>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="schemaProjectTypeT" id="schemaProjectTypeT"
                               checked={switchboard.projectType === "T"}
                               onChange={() => setSwitchboard((old) => ({...old, projectType: "T"}))}/>
                        <label htmlFor="schemaProjectTypeT" title="Project tertiaire">
                            <img src={compagnyIcon} alt="Project tertiaire" width={24} height={24}/>
                        </label>
                    </div>
                </div>
                <div className="tabPageBandGroup">
                    <div className="tabPageBandCol">
                        <span style={{fontSize: 'smaller', lineHeight: 1.2}}>Tension de<br/>référence:</span>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="number" name="schemaVRef" id="schemaVRef" step={1} min={0} max={400}
                               value={switchboard.vref}
                               onChange={(e) => setSwitchboard((old) => ({...old, vref: e.target.value}))}/>
                    </div>
                </div>

                <div className="tabPageBandSeparator"></div>

                <div className="tabPageBandGroup">
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="schemaWithDbChoice" id="schemaWithDbChoice"
                               checked={switchboard.withDb} onChange={() => setSwitchboard((old) => ({
                            ...old,
                            db: {...old.db, func: 'db'},
                            withDb: !old.withDb
                        }))}/>
                        <label htmlFor="schemaWithDbChoice" title="Intégrer un disjoncteur de branchement">
                            <img src={switchboard.withDb ? boltIcon : noboltIcon} alt="Disjoncteur de branchement"
                                 width={24} height={24}/>
                        </label>
                    </div>
                    <div className="tabPageBandCol">
                        <select value={switchboard.db.type} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            db: {...old.db, type: e.target.value}
                        }))} disabled={!switchboard.withDb}>
                            <option value="">Instantané</option>
                            <option value="S">Sélectif</option>
                        </select>
                    </div>
                    <div className="tabPageBandCol">
                        <select value={switchboard.db.pole} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            db: {...old.db, pole: e.target.value}
                        }))} disabled={!switchboard.withDb}>
                            <option value="1P+N">Monophasé</option>
                            <option value="3P+N">Triphasé</option>
                        </select>
                    </div>
                    <div className="tabPageBandCol">
                        <select value={switchboard.db.sensibility} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            db: {...old.db, sensibility: e.target.value}
                        }))} disabled={!switchboard.withDb}>
                            <option value="500mA">500mA</option>
                        </select>
                    </div>
                    <div className="tabPageBandCol">
                        <select value={switchboard.db.current} onChange={(e) => setSwitchboard((old) => ({
                            ...old,
                            db: {...old.db, current: e.target.value}
                        }))} disabled={!switchboard.withDb}>
                            <option value="10/30A">10/30A</option>
                            <option value="15/45A">15/45A</option>
                            <option value="30/60A">30/60A</option>
                            <option value="60/90A">60/90A</option>
                            <option value="60A">60A mono-calibre</option>
                        </select>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="schemaWithGroundChoice" id="schemaWithGroundChoice"
                               checked={switchboard.withGroundLine} onChange={() => setSwitchboard((old) => ({
                            ...old,
                            withGroundLine: !old.withGroundLine
                        }))}/>
                        <label htmlFor="schemaWithGroundChoice" title="Représenter le bornier de terre">
                            <img src={switchboard.withGroundLine ? groundIcon : nogroundIcon} alt="Bornier de terre"
                                 width={24} height={24}/>
                        </label>
                    </div>
                    {/**<div className="tabPageBandSeparator"></div>**/}
                </div>

                <div className="tabPageBandNL"></div>

                <div className="tabPageBandGroup">
                    <div className="tabPageBandCol">
                        <button style={{height: '34px'}}
                                title="Ré-assigner automatiquement les identifiants des modules de l'ensemble du projet."
                                onClick={() => reassignModules()}>
                            <img src={numbersIcon} alt="Ré-assigner automatiquement les identifiants" width={22}
                                 height={22}/>
                        </button>
                    </div>
                    <div className="tabPageBandCol">
                        <input type="checkbox" name="schemaMonitorChoice" id="schemaMonitorChoice"
                               checked={switchboard.schemaMonitor}
                               onChange={() => setSwitchboard((old) => ({...old, schemaMonitor: !old.schemaMonitor}))}/>
                        <label htmlFor="schemaMonitorChoice" title="Conseils et Surveillance (NFC 15-100)"
                               className={`${monitor.errors ? 'error' : ''}`}>
                            <img src={switchboard.schemaMonitor ? monitorIcon : nomonitorIcon}
                                 alt="Conseils et Surveillance (NFC 15-100)" width={24} height={24}/>
                        </label>
                    </div>
                    {switchboard.schemaMonitor && (
                        <div className="tabPageBandCol">
                            {monitorWarningsLength > 0
                                ? <>
                                    <span>{`${monitorWarningsLength} erreur${monitorWarningsLength > 1 ? 's' : ''} détectée${monitorWarningsLength > 1 ? 's' : ''}.`}</span>
                                    <img src={info2Icon} alt="Détails des erreurs" title="Détails des erreurs"
                                         width={20} height={20} style={{cursor: 'pointer', padding: '4px'}}
                                         onClick={() => setMonitorOpened(old => !old)}/>
                                </>
                                : <span>Aucune erreur détectée.</span>
                            }
                        </div>
                    )}
                </div>
            </div>

            {switchboard.schemaMonitor && monitorOpened && monitor.errors && (
                <div className="tabPageBand notprintable errors" ref={monitorRef} tabIndex={-1}
                     onBlur={() => setMonitorOpened(false)}>
                    <div className="closeButton" title={"Fermer"} onClick={() => setMonitorOpened(false)}>
                        <img src={cancelIcon} width={24} height={24} alt={"Fermer"}/>
                    </div>
                    <div className="tabPageBandCol"
                         style={{height: 'max-content', minHeight: 'max-content', maxHeight: 'max-content'}}>
                        <ul>
                            {Object.entries(monitor.errors ?? {}).map(([id, errors], i) => (
                                <li key={i} className="tabPageErrors">
                                    <div>{id}:</div>
                                    <ul>
                                        {errors.map((error, j) => <li key={j} className="tabPageError">
                                            <img src={`${import.meta.env.BASE_URL}schema_warning.svg`} alt="Erreurs"
                                                 width={16} height={16}/>
                                            <span>{error}</span>
                                        </li>)}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div
                className={`schemaCartbridgeContainer ${printOptions.coverPage ? 'printable' : 'notprintable'}`.trim()}>
                <div className="schemaTitle">Schéma Unifilaire Général</div>
                <div className="schemaCartbridge">
                    <div className="schemaCartbridgeA">
                        Créé: {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                        timeZone: 'Europe/Paris',
                    }).format(switchboard.prjcreated ?? (new Date()))}
                    </div>
                    <div className="schemaCartbridgeB">
                        <div className="schemaCartbridgeBContent">
                            {switchboard.prjname ?? import.meta.env.VITE_DEFAULT_PROJECT_NAME}
                        </div>
                    </div>
                    <div className="schemaCartbridgeC">
                        Révision {switchboard.prjversion ?? 1}
                    </div>
                    <div className="schemaCartbridgeD">
                        Modifié: {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                        timeZone: 'Europe/Paris',
                    }).format(switchboard.prjupdated ?? (new Date()))}
                    </div>
                    <div className="schemaCartbridgeE">
                        {pkg.title} {pkg.version}
                    </div>
                    <div className="schemaCartbridgeF">
                        <img src={`${import.meta.env.VITE_APP_BASE}favicon.svg`} width="64" height="64"
                             alt="Tiquettes"/>
                    </div>
                </div>
            </div>

            <div className="schemaGrid">
                <div className="schemaItemSeparator first"></div>
                <SchemaItem switchboard={switchboard} childs={tree.childs} schemaFunctions={schemaFunctions}
                            isFirst={true} parentIsFirst={true} onEditSymbol={(module) => handleEditSymbol(module)}
                            monitor={monitor}/>

                {switchboard.withGroundLine && (
                    <div className="schemaGroundLine">
                        <img className="" src={`${import.meta.env.VITE_APP_BASE}circuit-ground.svg`} width={24}
                             height={24}/>
                    </div>
                )}
            </div>
        </div>
    );
}