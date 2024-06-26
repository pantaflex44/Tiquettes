/* eslint-disable react/prop-types */
function Hager2Theme({ item, style }) {
    const styles = {
        iconContainer: {
            marginTop: `calc(${style['--h']} * 0.08)`,
            padding: `calc(${style['--h']} * 0.06)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#00689e"
        },
        icon: {
            
            width: `calc(${style['--h']} * 0.20)`,
            height: `calc(${style['--h']} * 0.20)`,
            filter: "invert()"
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
        },
        id: {
            textAlign: "center",
            fontSize: "2.6mm",
            fontWeight: "400",
            lineHeight: "4mm",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingInline: "1mm",
            width: "calc(100% - 2mm)",
            paddingBlock: `calc(${style['--h']} * 0.01)`,
        },
    };

    return (<>

        {item.icon
            ? <div style={styles.iconContainer}><img
                alt="Pictogramme"
                style={styles.icon}
                src={`${import.meta.env.VITE_APP_BASE}${item.icon}`}
            /></div>
            : <div style={styles.icon}>&nbsp;</div>
        }

        <div
            style={styles.text}
            dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}
        >
        </div>

        <div style={styles.id}>{item.id}</div>

    </>);
}

export default Hager2Theme;