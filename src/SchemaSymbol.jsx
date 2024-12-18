/* eslint-disable react/prop-types */

import {useMemo} from "react";

export default function SchemaSymbol({
                                         module,
                                         schemaFunctions,
                                         onEdit = null,
                                         isLast = false,
                                         monitor = {}
                                     }) {
    const func = useMemo(() => {
        if (!module?.func) return null;

        let func = module?.func;
        let isDb = false;
        if (func === 'db') {
            func = 'dd';
            isDb = true;
        }

        if (!schemaFunctions[func]) return null;

        return {name: func, isDb};
    }, [module]);

    const handleEdit = () => {
        if (onEdit) onEdit(module);
    }

    return func && (
        <div className={`schemaItemSymbol ${!func.isDb ? 'editable' : ''}`} title={schemaFunctions[func.name].name + (monitor.infos && monitor.infos[module.id] ? "\r\n\r\n" + monitor.infos[module.id] : "")} onClick={() => handleEdit()}>
            <img className="schemaItemSymbolImg" src={`${import.meta.env.BASE_URL}schema_${func.name}.svg`} alt={schemaFunctions[func.name].name} width={70} height={100}/>
            <div className="schemaItemSymbolId">{module.id}</div>

            {schemaFunctions[func.name]?.hasType && <div className="schemaItemSymbolType">{module.type ? 'Type' : ''} {module.type}<br/>{module.sensibility}</div>}

            <div className="schemaItemSymbolCurrent">{((schemaFunctions[func.name]?.hasCrb && module.crb ? `${module.crb} ` : '') + (schemaFunctions[func.name]?.hasCurrent && module.current ? module.current : '')).trim()}</div>

            {schemaFunctions[func.name]?.hasPole && module.pole && (
                <>
                    <div className="schemaItemSymbolPole">{module.pole}</div>
                    <img className="schemaItemSymbolImgPole" src={`${import.meta.env.VITE_APP_BASE}schema_${module.pole}.svg`} alt={module.pole} width={11}/>
                </>
            )}

            {monitor.errors && monitor.errors[module.id] && <img className="schemaItemSymbolWarning" src={`${import.meta.env.BASE_URL}schema_warning.svg`} alt="Erreur"/>}
        </div>
    );
}