/* eslint-disable react/prop-types */
function Schneider1Theme({ item, style }) {
    const styles = {
        id: {
            textAlign: "center",
            fontSize: "2.5mm",
            fontWeight: "bold",
            lineHeight: "4mm",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingInline: "1mm",
            width: "calc(100% - 2mm)",
            marginTop: `calc(${style['--h']} * 0.05)`
        },
        icon: {
            width: `calc(${style['--h']} * 0.22)`,
            height: `calc(${style['--h']} * 0.22)`
        },
        text: {
            textAlign: "center",
            fontSize: "2.6mm",
            fontWeight: "600",
            inlineSize: "150px",
            overflowWrap: "break-word",
            overflowY: "hidden",
            paddingInline: "1mm",
            paddingTop: "1mm",
            paddingBottom: "1.2mm",
            width: "calc(100% - 2mm)",
            backgroundColor: "#009E4D",
            color: "white",
            height: `calc(${style['--h']} * 0.34)`,
            maxHeight: `calc(${style['--h']} * 0.34)`
        },
        paste: {
            textAlign: "center",
            fontSize: "3mm",
            fontWeight: "600",
            inlineSize: "150px",
            overflowWrap: "break-word",
            overflowY: "hidden",
            paddingInline: "1mm",
            paddingTop: "1mm",
            paddingBottom: "1.2mm",
            width: "calc(100% - 2mm)",
            color: "darkcyan",
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
                dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}></div>

    </>);
}

export default Schneider1Theme;