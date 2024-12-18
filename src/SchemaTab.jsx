/* eslint-disable react/prop-types */

import {useCallback, useMemo, useState} from "react";

import SchemaItem from "./SchemaItem.jsx";

import * as pkg from '../package.json';
import swbIcons from './switchboard_icons.json';

import monitorIcon from './assets/monitor.svg';
import nomonitorIcon from './assets/nomonitor.svg';
import boltIcon from './assets/bolt.svg';
import noboltIcon from './assets/nobolt.svg';
import groundIcon from './assets/ground.svg';
import nogroundIcon from './assets/noground.svg';
import caretUpIcon from "./assets/caret-up.svg";
import caretDownIcon from "./assets/caret-down.svg";
import homeIcon from "./assets/home.svg";
import compagnyIcon from "./assets/compagny.svg";

export default function SchemaTab({
                                      tab,
                                      switchboard,
                                      setSwitchboard,
                                      printOptions,
                                      schemaFunctions,
                                      onEditSymbol = null,
                                  }) {
    const [monitorOpened, setMonitorOpened] = useState(false);

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
            const childs = getRow(getChilds(module.id));
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
    }, [switchboard.rows, switchboard.withDb]);

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
        )
    ;

    const monitor = useMemo(() => {
        if (!switchboard.schemaMonitor) return {};

        let result = {};
        let nbIdTypeA30 = 0;
        let nbIdTypeAC30 = 0;

        function id_monitoring(childs, lastId = null) {
            let lid = lastId;

            Object.entries(childs).forEach(([id, data]) => {
                    if (data.module?.func === 'id') {
                        let id_errors = (result.errors ?? [])[id] ?? [];

                        const idPole = data.module?.pole ?? "1P+N";
                        const isTri = idPole === "3P" || idPole === "4P" || idPole === "3P+N";
                        const isMono = idPole === "1P+N";
                        const vmod = switchboard.vref * (isTri ? 3 : (isMono ? 1 : 1));
                        const maxCurrent = parseInt((data.module?.current ?? "0").replace(/\D/g, '').trim());
                        const powers = Object.entries(data.childs).map(([_, cdata]) => {
                            if (cdata.module?.func === 'q') {
                                const current = parseInt((cdata.module?.current ?? "0").replace(/\D/g, '').trim());
                                const coef = switchboard.projectType === 'R' && isMono ? Math.round((cdata.module?.coef ?? 0.5) * 10) / 10 : 1;
                                const factor = (cdata.module?.pole ?? '') === '3P' ? Math.sqrt(3) : 1;
                                return ((current * coef) / factor) * switchboard.vref;
                            }
                            return 0;
                        });

                        const total = Math.ceil((powers.reduce((partialSum, a) => partialSum + a, 0)) / vmod);
                        result = {...result, infos: {...result.infos, [id]: `Charge retenue: ${total}A sur un maximum autorisé de ${maxCurrent}A`}}
                        if (total > maxCurrent) {
                            const id_error = `La charge retenue (${total}A) est supérieure à la limite définie: ${maxCurrent}A`;
                            if (!id_errors.includes(id_error)) id_errors.push(id_error);
                        }

                        const nbChilds = Object.keys(data.childs).length;
                        if (nbChilds > 8) {
                            const id_error2 = `La norme NFC 15-100 autorise un maximum de 8 circuits par interrupteur différentiel.`;
                            if (!id_errors.includes(id_error2)) id_errors.push(id_error2);
                        }

                        const idSensibility = parseInt((data.module?.sensibility ?? '0').replace(/\D/g, ''));
                        if ((data.module?.type ?? '').toUpperCase() === 'A' && idSensibility === 30) nbIdTypeA30++;
                        if ((data.module?.type ?? '').toUpperCase() === 'AC' && idSensibility === 30) nbIdTypeAC30++;

                        if (id_errors.length > 0) result = {...result, errors: {...result.errors, [id]: id_errors}};

                        lid = data.module;
                    }

                    if (data.module?.func === 'db') {
                        const cs = (data.module?.current ?? "0").split('/');
                        let minCurrent = 0;
                        if (cs.length > 0) minCurrent = parseInt(cs[cs.length - 1].replace(/\D/g, ''));

                        Object.entries(data.childs).forEach(([cid, cdata]) => {
                            if (cdata.module?.func === 'sw') {
                                const c = parseInt((cdata.module?.current ?? "0").replace(/\D/g, '').trim());
                                if (c < minCurrent) {
                                    let db_errors = (result.errors ?? [])[cid] ?? [];
                                    const db_error = `Le calibre choisi (${c}A) doit être supérieur au calibre maximum du disjoncteur de branchement: ${minCurrent}A`;
                                    if (!db_errors.includes(db_error)) db_errors.push(db_error);
                                    if (db_errors.length > 0) result = {...result, errors: {...result.errors, [cid]: db_errors}};
                                }
                            }
                        });
                    }

                    if (data.module?.func === 'q' && data.module?.id) {
                        let q_errors = (result.errors ?? [])[data.module.id] ?? [];

                        const current2 = parseInt((data.module?.current ?? "0").replace(/\D/g, '').trim());
                        const power2 = current2 * switchboard.vref;
                        const pole2 = data.module?.pole ?? "1P+N";
                        const isTetra2 = pole2 === "4P" || pole2 === "3P+N";
                        const round2 = (value) => {
                            if (value >= 1000) return {value: Math.round((value / 1000) * 100) / 100, unit: 'kW'};
                            if (value >= 1000000) return {value: Math.round((value / 1000000) * 100) / 100, unit: 'm.W'};
                            return {value, unit: 'W'};
                        }
                        const v = round2(power2 * (isTetra2 ? 3 : 1));
                        result = {...result, infos: {...result.infos, [id]: `Puissance maximum admissible: ${v.value}${v.unit}`}}

                        const icon = data.module?.icon ?? '';
                        const found = swbIcons.filter((i) => i.filename === icon);
                        if (found.length === 1 && found[0].requiredIdTypes) {
                            if (!found[0].requiredIdTypes.includes(lid?.type ?? '')) {
                                const q_error = `Ce départ doit être couvert par une protection différentielle de type: ${found[0].requiredIdTypes.join(', ')}. Type actuel: ${lid?.type ?? ''}`;
                                if (!q_errors.includes(q_error)) q_errors.push(q_error);
                            }
                        }

                        if (q_errors.length > 0) result = {...result, errors: {...result.errors, [data.module.id]: q_errors}};
                    }


                    id_monitoring(data.childs, lid);
                }
            );
        }

        id_monitoring(tree.childs);

        let main_errors = (result.errors ?? [])['Global'] ?? [];
        if (nbIdTypeA30 + nbIdTypeAC30 < 2) {
            const types_error = `Une installation électrique doit être protégée par au moins 2 interrupteurs différentiels (30mA).`;
            if (!main_errors.includes(types_error)) main_errors.push(types_error);
        }
        if (main_errors.length > 0) result = {...result, errors: {...result.errors, 'Global': main_errors}};

        return result;
    }, [tree?.childs, switchboard.schemaMonitor, switchboard.projectType, switchboard.vref]);
    const monitorWarningsLength = useMemo(() => Object.values(monitor.errors ?? {}).map((e) => e.flat()).length, [monitor]);

    return (
        <div className={`schema ${tab === 2 ? 'selected' : ''} ${printOptions.schema ? 'printable' : 'notprintable'}`.trim()}>
            <div className="tabPageBand notprintable">
                <div className="tabPageBandCol">
                    <input type="checkbox" name="schemaProjectTypeR" id="schemaProjectTypeR" checked={switchboard.projectType === "R"} onChange={() => setSwitchboard((old) => ({...old, projectType: "R"}))}/>
                    <label htmlFor="schemaProjectTypeR" title="Project résidentiel">
                        <img src={homeIcon} alt="Project résidentiel" width={24} height={24}/>
                    </label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="schemaProjectTypeT" id="schemaProjectTypeT" checked={switchboard.projectType === "T"} onChange={() => setSwitchboard((old) => ({...old, projectType: "T"}))}/>
                    <label htmlFor="schemaProjectTypeT" title="Project tertiaire">
                        <img src={compagnyIcon} alt="Project tertiaire" width={24} height={24}/>
                    </label>
                </div>
                <div className="tabPageBandCol">
                    <span style={{fontSize: 'smaller', lineHeight: 1.2}}>Tension de<br/>référence :</span>
                </div>
                <div className="tabPageBandCol">
                    <input type="number" name="schemaVRef" id="schemaVRef" step={1} min={0} max={400} value={switchboard.vref} onChange={(e) => setSwitchboard((old) => ({...old, vref: e.target.value}))}/>
                </div>

                <div className="tabPageBandSeparator"></div>

                <div className="tabPageBandCol">
                    <input type="checkbox" name="schemaWithDbChoice" id="schemaWithDbChoice" checked={switchboard.withDb} onChange={() => setSwitchboard((old) => ({...old, db: {...old.db, func: 'db'}, withDb: !old.withDb}))}/>
                    <label htmlFor="schemaWithDbChoice" title="Intégrer un disjoncteur de branchement">
                        <img src={switchboard.withDb ? boltIcon : noboltIcon} alt="Disjoncteur de branchement" width={24} height={24}/>
                    </label>
                </div>
                <div className="tabPageBandCol">
                    <select value={switchboard.db.type} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, type: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="">Instantané</option>
                        <option value="S">Sélectif</option>
                    </select>
                </div>
                <div className="tabPageBandCol">
                    <select value={switchboard.db.pole} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, pole: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="1P+N">Monophasé</option>
                        <option value="3P+N">Triphasé</option>
                    </select>
                </div>
                <div className="tabPageBandCol">
                    <select value={switchboard.db.sensibility} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, sensibility: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="500mA">500mA</option>
                    </select>
                </div>
                <div className="tabPageBandCol">
                    <select value={switchboard.db.current} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, current: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="10/30A">10/30A</option>
                        <option value="15/45A">15/45A</option>
                        <option value="30/60A">30/60A</option>
                        <option value="60/90A">60/90A</option>
                        <option value="60A">60A mono-calibre</option>
                    </select>
                </div>

                <div className="tabPageBandCol">
                    <input type="checkbox" name="schemaWithGroundChoice" id="schemaWithGroundChoice" checked={switchboard.withGroundLine} onChange={() => setSwitchboard((old) => ({...old, withGroundLine: !old.withGroundLine}))}/>
                    <label htmlFor="schemaWithGroundChoice" title="Représenter le bornier de terre">
                        <img src={switchboard.withGroundLine ? groundIcon : nogroundIcon} alt="Bornier de terre" width={24} height={24}/>
                    </label>
                </div>

                <div className="tabPageBandSeparator"></div>

                <div className="tabPageBandCol">
                    <input type="checkbox" name="schemaMonitorChoice" id="schemaMonitorChoice" checked={switchboard.schemaMonitor} onChange={() => setSwitchboard((old) => ({...old, schemaMonitor: !old.schemaMonitor}))}/>
                    <label htmlFor="schemaMonitorChoice" title="Conseils et Surveillance (NFC 15-100)" className={`${monitor.errors ? 'error' : ''}`}>
                        <img src={switchboard.schemaMonitor ? monitorIcon : nomonitorIcon} alt="Conseils et Surveillance (NFC 15-100)" width={24} height={24}/>
                    </label>
                </div>
                {switchboard.schemaMonitor && (
                    <div className="tabPageBandCol">
                        {monitorWarningsLength > 0
                            ? <>
                                <span>{`${monitorWarningsLength} erreur${monitorWarningsLength > 1 ? 's' : ''} détectée${monitorWarningsLength > 1 ? 's' : ''}.`}</span>
                                <img src={monitorOpened ? caretUpIcon : caretDownIcon} alt="Liste des erreurs" width={16} height={16} style={{cursor: 'pointer', padding: '4px'}} onClick={() => setMonitorOpened(old => !old)}/>
                            </>
                            : <span>Aucune erreur détectée.</span>
                        }
                    </div>
                )}
            </div>

            {switchboard.schemaMonitor && monitorOpened && monitor.errors && (
                <div className="tabPageBand notprintable errors">
                    <div className="tabPageBandCol" style={{height: 'max-content', minHeight: 'max-content', maxHeight: 'max-content'}}>
                        <ul>
                            {Object.entries(monitor.errors ?? {}).map(([id, errors], i) => (
                                <li key={i} className="tabPageErrors">
                                    <div>{id}:</div>
                                    <ul>
                                        {errors.map((error, j) => <li key={j} className="tabPageError">
                                            <img src={`${import.meta.env.BASE_URL}schema_warning.svg`} alt="Erreurs" width={16} height={16}/>
                                            <span>{error}</span>
                                        </li>)}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className={`schemaCartbridgeContainer ${printOptions.coverPage ? 'printable' : 'notprintable'}`.trim()}>
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
                        <img src={`${import.meta.env.VITE_APP_BASE}favicon.svg`} width="64" height="64" alt="Tiquettes"/>
                    </div>
                </div>
            </div>

            <div className="schemaGrid">
                <div className="schemaItemSeparator first"></div>
                <SchemaItem childs={tree.childs} schemaFunctions={schemaFunctions} isFirst={true} parentIsFirst={true} onEditSymbol={(module) => handleEditSymbol(module)} monitor={monitor}/>

                {switchboard.withGroundLine && (
                    <div className="schemaGroundLine">
                        <img className="" src={`${import.meta.env.VITE_APP_BASE}circuit-ground.svg`} width={24} height={24}/>
                    </div>
                )}
            </div>
        </div>
    );
}