/* eslint-disable react/prop-types */
import summaryRowIcon from "./assets/summary_row.svg";
import summaryPositionIcon from "./assets/summary_position.svg";
import summaryNoPicto from "./assets/summary_nopicto.svg";

export default function SummaryTab({
                                       tab,
                                       switchboard,
                                       printOptions,
                                       schemaFunctions,
                                   }) {
    return (
        <div className={`summary ${tab === 3 ? 'selected' : ''} ${printOptions.summary ? 'printable' : 'notprintable'}`.trim()}>
            <table>
                <caption>
                    Nomenclature: {switchboard.prjname}
                </caption>
                <thead>
                <tr>
                    <th style={{width: '100px', paddingRight: '1em'}}>Rangée</th>
                    <th style={{width: '60px', paddingRight: '1em'}}>Position</th>
                    <th style={{width: '50px', paddingRight: '1em', textAlign: 'center'}}>Type</th>
                    <th style={{width: '110px', paddingRight: '1em'}}>Identifiant</th>
                    <th style={{width: '230px', paddingRight: '1em'}}>Fonction</th>
                    <th style={{width: '210px', paddingRight: '1em'}}>Libellé</th>
                    <th>Annotations</th>
                </tr>
                </thead>
                <tbody>
                {switchboard.rows.map((row, i) => {
                    let li = -1;
                    return row.map((module, j) => {
                        if (!module.free) {
                            const ret = <tr key={`${i}-${j}`} className={`${li !== i ? 'newrow' : 'otherrow'}`.trim()}>
                                <td className="summary_row">{li !== i ? <div><img src={summaryRowIcon} width={16} height={16} alt="Rangée"/><span>Rangée {i + 1}</span></div> : null}</td>
                                <td className="summary_position">
                                    <div><img src={summaryPositionIcon} width={16} height={16} alt="Position"/><span>P{`${j + 1}`.padStart(2, '0')}</span></div>
                                </td>
                                <td className="summary_type">
                                    <div>{module.icon ? <img src={module.icon} width={16} height={16} alt="Pictogramme"/> : <img src={summaryNoPicto} width={16} height={16} alt="Remplacement"/>}</div>
                                </td>
                                <td className="summary_id">
                                    <div>{module.id}</div>
                                </td>
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
                                <td className="summary_text">
                                    <div>{module.text}</div>
                                </td>
                                <td className="summary_text">
                                    <div>{module.desc}</div>
                                </td>
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