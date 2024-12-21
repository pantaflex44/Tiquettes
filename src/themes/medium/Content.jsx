/* eslint-disable react/prop-types */
function MediumTheme({ item, style }) {
    const styles = {
        id: {
            textAlign: "center",
            fontSize: "2.2mm",
            fontWeight: "bold",
            lineHeight: "4mm",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingInline: "1mm",
            width: "calc(100% - 2mm)",
            marginTop: `calc(${style['--h']} * 0.07)`,
            color: "darkcyan"
        },
        icon: {
            width: `calc(${style['--h']} * 0.19)`,
            height: `calc(${style['--h']} * 0.19)`
        },
        text: {
            textAlign: "center",
            fontSize: "2.4mm",
            fontWeight: "bold",
            inlineSize: "150px",
            overflowWrap: "break-word",
            overflowY: "hidden",
            paddingInline: "1mm",
            paddingTop: "1mm",
            paddingBottom: "1.4mm",
            width: "calc(100% - 2mm)",
            height: `calc(${style['--h']} * 0.46)`
        }
    };

    return (<>

        <div style={styles.id}>{item.id}</div>

        {item.icon && <img
            alt="Pictogramme"
            style={styles.icon}
            src={`${import.meta.env.VITE_APP_BASE}${item.icon}`}
        />}

        <div
            style={styles.text}
            dangerouslySetInnerHTML={{ __html: item.text.replaceAll("\n", "<br />") }}
        ></div>

    </>);
}

export default MediumTheme;