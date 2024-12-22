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

export default function SchemaDescription({
                                              module
                                          }) {
    return (
        /*<div className="schemaItemLast">*/
        <>
            {module.icon && (
                <div className="schemaItemLastIconContainer" title={module.text}>
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