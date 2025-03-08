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

import ThemeEditorPartColumnTitle from "./ThemeEditorPartColumnTitle.jsx";
import TextPartStyleEditor from "./TextPartStyleEditor.jsx";

export default function ThemeEditorPartColumn({
                                                  propName,
                                                  title,
                                                  shownCount,
                                                  positions,
                                                  editedTheme,
                                                  setEditedTheme,
                                                  up,
                                                  down
                                              }) {
    return <>
        <div className={'tep-settings_column'}>
            <ThemeEditorPartColumnTitle propName={propName}
                                        title={title}
                                        setEditedTheme={setEditedTheme}
                                        positions={positions}
                                        shownCount={shownCount}
                                        down={down}
                                        up={up}
            />
            <TextPartStyleEditor propName={propName}
                                 editedTheme={editedTheme}
                                 setEditedTheme={setEditedTheme}
                                 positions={positions}/>
        </div>
    </>;
}