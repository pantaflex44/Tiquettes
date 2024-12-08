/* eslint-disable react/prop-types */

export default function SchemaDescription({
                                              module
                                          }) {
    return (
        /*<div className="schemaItemLast">*/
        <>
            {module.icon && (
                <div className="schemaItemLastIconContainer">
                <img
                    alt="Pictogramme"
                    width={24}
                    height={24}
                    src={`${import.meta.env.VITE_APP_BASE}${module.icon}`}
                    className="schemaItemLastIcon"
                />
                </div>
            )}
            <div className="schemaItemLastText">{module.text}</div>
        </>
        /*</div>*/
    );
}