/* eslint-disable react/prop-types */
function Schneider2Theme({ item, style }) {
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
            paddingTop: "1.5mm",
            paddingBottom: `calc(${style['--h']} * 0.02)`,
            backgroundColor: "#009E4D",
            color: "white",
        },
        icon: {
            width: `calc(${style['--h']} * 0.22)`,
            height: `calc(${style['--h']} * 0.22)`
        },
        text: {
            textAlign: "center",
            fontSize: "2.8mm",
            fontWeight: "500",
            inlineSize: "150px",
            overflowWrap: "break-word",
            overflowY: "hidden",
            paddingInline: "1mm",
            paddingTop: "0.5mm",
            paddingBottom: "1.5mm",
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

export default Schneider2Theme;