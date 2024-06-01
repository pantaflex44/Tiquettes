/* eslint-disable react/prop-types */
function Legrand2Theme({ item, style }) {
    const styles = {
        iconContainer: {
            marginTop: `calc(${style['--h']} * 0.08)`,
            padding: `calc(${style['--h']} * 0.07)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderBottom: "4px solid #555"
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

export default Legrand2Theme;