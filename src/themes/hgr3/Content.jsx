import Color from '../../color.js';
import Solver from '../../colorSolver.js';

/* eslint-disable react/prop-types */
function Hager3Theme({ item, style }) {
    let color = new Color(36, 179, 232);
    let solver = new Solver(color);
    let solvedColor = solver.solve();

    const styles = {
        iconContainer: {
            marginTop: `calc(${style['--h']} * 0.08)`,
            padding: `calc(${style['--h']} * 0.07)`,
            filter: solvedColor.value,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        icon: {
            width: `calc(${style['--h']} * 0.25)`,
            height: `calc(${style['--h']} * 0.25)`,
        },
        text: {
            textAlign: "center",
            fontSize: "2.8mm",
            fontWeight: "500",
            inlineSize: "150px",
            overflowWrap: "break-word",
            overflowY: "hidden",
            paddingInline: "1mm",
            paddingTop: "1mm",
            paddingBottom: "1.2mm",
            width: "calc(100% - 2mm)",
            height: `calc(${style['--h']} * 0.34)`,
        }
    };

    return (<>

        {item.icon
            ? <div style={styles.iconContainer}>
                <img
                    alt="Pictogramme"
                    style={styles.icon}
                    src={`${import.meta.env.VITE_APP_BASE}${item.icon}`}
                />
            </div>
            : <div style={styles.icon}>&nbsp;</div>
        }

        <div
            style={styles.text}
            dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}
        >
        </div>

    </>);
}

export default Hager3Theme;