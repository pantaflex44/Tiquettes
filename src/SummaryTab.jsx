/* eslint-disable react/prop-types */
import summaryRowIcon from "./assets/summary_row.svg";
import summaryPositionIcon from "./assets/summary_position.svg";
import summaryNoPicto from "./assets/summary_nopicto.svg";
import themesList from "./themes.json";
import {Fragment} from "react";
import monitorIcon from "./assets/monitor.svg";
import nomonitorIcon from "./assets/nomonitor.svg";
import caretUpIcon from "./assets/caret-up.svg";
import caretDownIcon from "./assets/caret-down.svg";

export default function SummaryTab({
                                       tab,
                                       switchboard,
                                       setSwitchboard,
                                       printOptions,
                                       schemaFunctions,
                                   }) {
    return (
        <div className={`summary ${tab === 3 ? 'selected' : ''} ${printOptions.summary ? 'printable' : 'notprintable'}`.trim()}>
            <div className="tabPageBand notprintable">
                <div className="tabPageBandCol">
                    <span>Afficher les colones :</span>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnRowChoice" id="summaryColumnRowChoice" checked={switchboard.summaryColumnRow} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnRow: e.target.checked}))}/>
                    <label htmlFor="summaryColumnRowChoice" title="Colone 'Rangée'">Rangée</label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnPositionChoice" id="summaryColumnPositionChoice" checked={switchboard.summaryColumnPosition} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnPosition: e.target.checked}))}/>
                    <label htmlFor="summaryColumnPositionChoice" title="Colone 'Position'">Position</label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnTypeChoice" id="summaryColumnTypeChoice" checked={switchboard.summaryColumnType} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnType: e.target.checked}))}/>
                    <label htmlFor="summaryColumnTypeChoice" title="Colone 'Type'">Type</label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnIdChoice" id="summaryColumnIdChoice" checked={switchboard.summaryColumnId} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnId: e.target.checked}))}/>
                    <label htmlFor="summaryColumnIdChoice" title="Colone 'Identifiant'">Identifiant</label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnFunctionChoice" id="summaryColumnFunctionChoice" checked={switchboard.summaryColumnFunction} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnFunction: e.target.checked}))}/>
                    <label htmlFor="summaryColumnFunctionChoice" title="Colone 'Fonction'">Fonction</label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnLabelChoice" id="summaryColumnLabelChoice" checked={switchboard.summaryColumnLabel} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnLabel: e.target.checked}))}/>
                    <label htmlFor="summaryColumnLabelChoice" title="Colone 'Libellé'">Libellé</label>
                </div>
                <div className="tabPageBandCol">
                    <input type="checkbox" name="summaryColumnDescriptionChoice" id="summaryColumnDescriptionChoice" checked={switchboard.summaryColumnDescription} onChange={(e) => setSwitchboard((old) => ({...old, summaryColumnDescription: e.target.checked}))}/>
                    <label htmlFor="summaryColumnDescriptionChoice" title="Colone 'Annotations'">Annotations</label>
                </div>
            </div>

            <table>
                <thead>
                <tr>
                    {switchboard.summaryColumnRow && <th style={{width: '100px', paddingRight: '1em'}}>Rangée</th>}
                    {switchboard.summaryColumnPosition && <th style={{width: '60px', paddingRight: '1em'}}>Position</th>}
                    {switchboard.summaryColumnType && <th style={{width: '50px', paddingRight: '1em', textAlign: 'center'}}>Type</th>}
                    {switchboard.summaryColumnId && <th style={{width: '100px', paddingRight: '1em'}}>Identifiant</th>}
                    {switchboard.summaryColumnFunction && <th style={{width: '220px', paddingRight: '1em'}}>Fonction</th>}
                    {switchboard.summaryColumnLabel && <th style={{width: '210px', paddingRight: '1em'}}>Libellé</th>}
                    {switchboard.summaryColumnDescription && <th>Annotations</th>}
                </tr>
                </thead>
                <tbody>
                {switchboard.rows.map((row, i) => {
                    let li = -1;
                    return row.map((module, j) => {
                        if (!module.free) {
                            const ret = <tr key={`${i}-${j}`} className={`${li !== i ? 'newrow' : 'otherrow'}`.trim()}>
                                {switchboard.summaryColumnRow && (
                                    <td className="summary_row">{li !== i ? <div><img src={summaryRowIcon} width={16} height={16} alt="Rangée"/><span>Rangée {i + 1}</span></div> : null}</td>
                                )}
                                {switchboard.summaryColumnPosition && (
                                    <td className="summary_position">
                                        <div><img src={summaryPositionIcon} width={16} height={16} alt="Position"/><span>P{`${j + 1}`.padStart(2, '0')}</span></div>
                                    </td>
                                )}
                                {switchboard.summaryColumnType && (
                                    <td className="summary_type">
                                        <div>{module.icon ? <img src={module.icon} width={20} height={20} alt="Pictogramme"/> : <img src={summaryNoPicto} width={20} height={20} alt="Remplacement"/>}</div>
                                    </td>
                                )}
                                {switchboard.summaryColumnId && (
                                    <td className="summary_id">
                                        <div>{module.id}</div>
                                    </td>
                                )}
                                {switchboard.summaryColumnFunction && (
                                    <td className="summary_func">
                                        {schemaFunctions[module.func] && <p>
                                            {schemaFunctions[module.func]?.name ?? ""}
                                            <br/>
                                            {schemaFunctions[module.func]?.hasType === true && `Type ${module.type} `}
                                            {schemaFunctions[module.func]?.hasCrb === true && `Courbe ${module.crb} `}
                                            {schemaFunctions[module.func]?.hasType === true && `${module.sensibility} `}
                                            {`${module.current ?? ""} ${module.pole ?? ""}`.trim()}
                                        </p>}
                                    </td>
                                )}
                                {switchboard.summaryColumnLabel && (
                                    <td className="summary_text">
                                        <div>{module.text}</div>
                                    </td>
                                )}
                                {switchboard.summaryColumnDescription && (
                                    <td className="summary_text">
                                        <div>{module.desc}</div>
                                    </td>
                                )}
                            </tr>;
                            if (li !== i) li = i;
                            return ret;
                        }
                    })
                })}
                </tbody>
            </table>
        </div>
    );
}