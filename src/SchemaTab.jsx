/* eslint-disable react/prop-types */

import {useCallback, useMemo} from "react";

import SchemaItem from "./SchemaItem.jsx";

import * as pkg from '../package.json';
import swbIcons from './switchboard_icons.json';

import monitorIcon from './assets/monitor.svg';
import nomonitorIcon from './assets/nomonitor.svg';
import boltIcon from './assets/bolt.svg';
import noboltIcon from './assets/nobolt.svg';
import groundIcon from './assets/ground.svg';
import nogroundIcon from './assets/noground.svg';

export default function SchemaTab({
                                      tab,
                                      switchboard,
                                      setSwitchboard,
                                      printOptions,
                                      schemaFunctions,
                                      onEditSymbol = null,
                                  }) {
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

        function id_monitoring(childs, lastId = null) {
            let lid = lastId;

            Object.entries(childs).forEach(([id, data]) => {
                    if (data.module?.func === 'id') {
                        let id_errors = (result.errors ?? [])[id] ?? [];

                        const maxCurrent = parseInt((data.module?.current ?? "0").replace(/\D/g, '').trim());

                        const currents = Object.entries(data.childs).map(([_, cdata]) => {
                            if (cdata.module?.func === 'q') {
                                const current = parseInt((cdata.module?.current ?? "0").replace(/\D/g, '').trim());
                                const coef = cdata.module?.coef ?? 0.5;
                                return (current * coef);
                            }

                            return 0;
                        });
                        const total = currents.reduce((partialSum, a) => partialSum + a, 0);
                        result = {...result, infos: {...result.infos, [id]: `Charge courante: ${total}A sur un maximum autorisé de ${maxCurrent}A`}}
                        if (total > maxCurrent) {
                            const id_error = `La charge courante (${total}A) est supérieure à la limite définie: ${maxCurrent}A`;
                            if (!id_errors.includes(id_error)) id_errors.push(id_error);
                        }

                        if (id_errors.length > 0) {
                            result = {...result, errors: {...result.errors, [id]: id_errors}};
                        }

                        lid = data.module;
                    }

                    if (data.module?.func === 'db') {
                        const cs = (data.module?.current ?? "0").split('/');
                        let minCurrent = 0;
                        if (cs.length > 0) {
                            minCurrent = parseInt(cs[cs.length - 1].replace(/\D/g, ''));
                        }

                        Object.entries(data.childs).forEach(([cid, cdata]) => {
                            if (cdata.module?.func === 'sw') {
                                const c = parseInt((cdata.module?.current ?? "0").replace(/\D/g, '').trim());
                                if (c < minCurrent) {
                                    let db_errors = (result.errors ?? [])[cid] ?? [];
                                    const db_error = `Le calibre choisi (${c}A) doit être supérieur au calibre maximum du disjoncteur de branchement: ${minCurrent}A`;
                                    if (!db_errors.includes(db_error)) db_errors.push(db_error);
                                    if (db_errors.length > 0) {
                                        result = {...result, errors: {...result.errors, [cid]: db_errors}};
                                    }
                                }
                            }
                        });
                    }

                    if (data.module?.func === 'q' && data.module?.id) {
                        let q_errors = (result.errors ?? [])[data.module.id] ?? [];

                        const icon = data.module?.icon ?? '';
                        const found = swbIcons.filter((i) => i.filename === icon);
                        if (found.length === 1 && found[0].requiredIdTypes) {
                            if (!found[0].requiredIdTypes.includes(lid?.type ?? '')) {
                                const q_error = `Ce départ doit être couvert par une protection différentiele de type: ${found[0].requiredIdTypes.join(', ')}. Type actuel: ${lid?.type ?? ''}`;
                                if (!q_errors.includes(q_error)) q_errors.push(q_error);
                            }
                        }

                        if (q_errors.length > 0) {
                            result = {...result, errors: {...result.errors, [data.module.id]: q_errors}};
                        }
                    }

                    id_monitoring(data.childs, lid);
                }
            );
        }

        id_monitoring(tree.childs);
        return result;
    }, [tree?.childs, switchboard.schemaMonitor]);

    return (
        <div className={`schema ${tab === 2 ? 'selected' : ''} ${printOptions.schema ? 'printable' : 'notprintable'}`.trim()}>
            <div className="tabPageBand notprintable">
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
                    <label htmlFor="schemaMonitorChoice" title="Conseils et Surveillance">
                        <img src={switchboard.schemaMonitor ? monitorIcon : nomonitorIcon} alt="Conseils et Surveillance" width={24} height={24}/>
                    </label>
                </div>
            </div>

            {monitor.errors && (
                <div className="tabPageBand notprintable errors">
                    <div className="tabPageBandCol">
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

            <div className="schemaCartbridgeContainer">
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