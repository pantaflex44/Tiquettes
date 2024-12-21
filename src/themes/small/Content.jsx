/* eslint-disable react/prop-types */
function SmallTheme({ item, style }) {
    const styles = {
        icon: {
            marginTop: `calc(${style['--h']} * 0.15)`,
            width: `calc(${style['--h']} * 0.18)`,
            height: `calc(${style['--h']} * 0.18)`
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
            height: `calc(${style['--h']} * 0.55)`
        }
    };

    return (<>

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
        >
        </div>

    </>);
}

export default SmallTheme;