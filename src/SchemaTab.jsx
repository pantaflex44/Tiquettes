/* eslint-disable react/prop-types */

import {useCallback, useEffect, useMemo} from "react";

import SchemaItem from "./SchemaItem.jsx";

import * as pkg from '../package.json';

export default function SchemaTab({
                                      tab,
                                      switchboard,
                                      setSwitchboard,
                                      printOptions,
                                      schemaFunctions,
                                  }) {
    const getModuleById = (moduleId) => {
        let m = null;
        for (const row of switchboard.rows) {
            for (const module of row) {
                if (module.id === moduleId) {
                    m = module;
                    break;
                }
            }
        }
        return m;
    }

    const head = useMemo(() => {
        return switchboard.rows.map((row) => row.map((module) => {
            if ((module.func ?? '').trim() !== '' && ((module.parentId ?? '-').trim() === '' || !getModuleById(module.parentId))) {
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

    return (
        <div className={`schema ${tab === 2 ? 'selected' : ''} ${printOptions.schema ? 'printable' : 'notprintable'}`.trim()}>
            <div className="schemaDbSelectors notprintable">
                <div className="schemaDbSelectorsCol">
                    <input type="checkbox" name="schemaWithDbChoice" id="schemaWithDbChoice" checked={switchboard.withDb} onChange={() => setSwitchboard((old) => ({...old, withDb: !old.withDb}))}/>
                    <label htmlFor="schemaWithDbChoice">Inclure un disjoncteur de branchement</label>
                </div>
                <div className="schemaDbSelectorsCol">
                    <select value={switchboard.db.type} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, type: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="">Instantané</option>
                        <option value="S">Sélectif</option>
                    </select>
                </div>
                <div className="schemaDbSelectorsCol">
                    <select value={switchboard.db.pole} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, pole: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="1P+N">Monophasé</option>
                        <option value="3P+N">Triphasé</option>
                    </select>
                </div>
                <div className="schemaDbSelectorsCol">
                    <select value={switchboard.db.sensibility} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, sensibility: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="500mA">500mA</option>
                    </select>
                </div>
                <div className="schemaDbSelectorsCol">
                    <select value={switchboard.db.current} onChange={(e) => setSwitchboard((old) => ({...old, db: {...old.db, current: e.target.value}}))} disabled={!switchboard.withDb}>
                        <option value="10/30A">10/30A</option>
                        <option value="15/45A">15/45A</option>
                        <option value="30/60A">30/60A</option>
                        <option value="60/90A">60/90A</option>
                        <option value="60A">60A mono-calibre</option>
                    </select>
                </div>
            </div>

            <div className="schemaDbSelectors notprintable">
                <div className="schemaDbSelectorsCol">
                    <input type="checkbox" name="schemaWithGroundChoice" id="schemaWithGroundChoice" checked={switchboard.withGroundLine} onChange={() => setSwitchboard((old) => ({...old, withGroundLine: !old.withGroundLine}))}/>
                    <label htmlFor="schemaWithGroundChoice">Inclure le bornier de terre</label>
                </div>
            </div>

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
                <SchemaItem childs={tree.childs} schemaFunctions={schemaFunctions} isFirst={true} parentIsFirst={true}/>

                {switchboard.withGroundLine && (
                    <div className="schemaGroundLine">
                        <img className="" src={`${import.meta.env.VITE_APP_BASE}circuit-ground.svg`} width={24} height={24}/>
                    </div>
                )}
            </div>
        </div>
    );
}