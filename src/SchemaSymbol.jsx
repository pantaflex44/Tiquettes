/* eslint-disable react/prop-types */

export default function SchemaSymbol({
                                         module,
                                         schemaFunctions,
                                         isLast = false
                                     }) {
    return module?.func && (
        <div className="schemaItemSymbol">
            <img className="schemaItemSymbolImg" src={`./schema_${module.func}.svg`} alt={schemaFunctions[module.func].name} width={70} height={100}/>
            <div className="schemaItemSymbolId">{module.id}</div>

            {schemaFunctions[module.func]?.hasType && <div className="schemaItemSymbolType">{module.type ? 'Type' : ''} {module.type}<br/>{module.sensibility}</div>}

            <div className="schemaItemSymbolCurrent">{((schemaFunctions[module.func]?.hasCrb && module.crb ? `${module.crb} ` : '') + (schemaFunctions[module.func]?.hasCurrent && module.current ? module.current : '')).trim()}</div>

            {schemaFunctions[module.func]?.hasPole && module.pole && <div className="schemaItemSymbolPole">{module.pole}</div>}

            {isLast && schemaFunctions[module.func]?.hasPole && module.pole && <img className="schemaItemSymbolImgPole" src={`${import.meta.env.VITE_APP_BASE}schema_${module.pole}.svg`} alt={module.pole} width={11}/>}
        </div>
    );
}