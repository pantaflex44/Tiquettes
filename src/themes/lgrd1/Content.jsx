/* eslint-disable react/prop-types */
function Legrand1Theme({ item, style }) {
    const styles = {
        id: {
            textAlign: "center",
            fontSize: "2.5mm",
            fontWeight: "bold",
            lineHeight: "3mm",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingInline: "1mm",
            width: "calc(100% - 2mm)",
            paddingBlock: `calc(${style['--h']} * 0.04)`,
            borderBottom: "1px solid darkgray"
        },
        icon: {
            width: `calc(${style['--h']} * 0.21)`,
            height: `calc(${style['--h']} * 0.21)`,
            minHeight: `calc(${style['--h']} * 0.21)`,
            paddingBottom: "1mm",
            paddingInline: "1mm",
            borderBottom: "4px solid #555"
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
            height: `calc(${style['--h']} * 0.34)`
        }
    };

    return (<>

        <div style={styles.id}>{item.id}</div>

        {item.icon
            ? <img
                alt="Pictogramme"
                style={styles.icon}
                src={`${import.meta.env.VITE_APP_BASE}${item.icon}`}
            />
            : <div style={styles.icon}>&nbsp;</div>
        }

        <div
            style={styles.text}
            dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}
        ></div>

    </>);
}

export default Legrand1Theme;