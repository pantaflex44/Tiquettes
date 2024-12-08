/* eslint-disable react/prop-types */

import {useCallback, useMemo, useState} from "react";

import SchemaItem from "./SchemaItem.jsx";

import * as pkg from '../package.json';

export default function SchemaTab({
                                      tab,
                                      switchboard,
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
    }, [switchboard.rows]);

    const getChilds = useCallback((parentId) => {
        return switchboard.rows.map((row) => row.map((module) => {
            if ((module.func ?? '').trim() !== '' && module.parentId === parentId) {
                return module;
            }
        })).flat().filter((module) => module);
    }, [switchboard.rows]);

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
    }, [switchboard.rows]);

    const tree = useMemo(() => switchboard.withDB
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
            [head]
        )
    ;

    return (
        <div className={`schema ${tab === 2 ? 'selected' : ''} ${printOptions.schema ? 'printable' : 'notprintable'}`.trim()}>
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

                <div className="schemaGroundLine">
                    <img className="" src={`${import.meta.env.VITE_APP_BASE}circuit-ground.svg`} width={24} height={24}/>
                </div>
            </div>
        </div>
    );
}