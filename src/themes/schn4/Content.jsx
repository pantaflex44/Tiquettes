/* eslint-disable react/prop-types */
function Schneider4Theme({ item, style }) {
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
            height: `calc(${style['--h']} * 0.12)`,
            backgroundColor: "#009E4D",
            color: "white",
        },
        icon: {
            width: `calc(${style['--h']} * 0.25)`,
            height: `calc(${style['--h']} * 0.25)`,
            marginTop: `calc(${style['--h']} * 0.1)`
        },
        text: {
            textAlign: "center",
            fontSize: "2.8mm",
            fontWeight: "bold",
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

        {item.icon
            ? <img
                style={styles.icon}
                src={`${import.meta.env.VITE_APP_BASE}${item.icon}`}
            />
            : <div style={styles.icon}>&nbsp;</div>
        }

        <div
            style={styles.text}
            dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}
        ></div>

        <div style={styles.id}></div>

    </>);
}

export default Schneider4Theme;