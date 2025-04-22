/* eslint-disable react/prop-types */

import {useMemo} from "react";
import Color, {hexToRgb} from "./color.js";
import Solver from "./colorSolver.js";

function CustomTheme({item, data, style}) {
    const shown = useMemo(() => ({
        id: (data?.id?.shown ?? true) === true,
        icon: (data?.icon?.shown ?? true) === true,
        text: (data?.text?.shown ?? true) === true
    }), [data]);
    const shownCount = useMemo(() => ([shown.id ? 1 : 0, shown.icon ? 1 : 0, shown.text ? 1 : 0].reduce((acc, cur) => acc + cur, 0)), [shown]);

    const positions = useMemo(() => {
        let idPosition = (data?.id?.position ?? 'top');
        let iconPosition = (data?.icon?.position ?? 'middle');
        let textPosition = (data?.text?.position ?? 'bottom');
        if (idPosition !== 'top' && idPosition !== 'middle' && idPosition !== 'bottom') idPosition = 'top';
        if (iconPosition !== 'top' && iconPosition !== 'middle' && iconPosition !== 'bottom') iconPosition = 'middle';
        if (textPosition !== 'top' && textPosition !== 'middle' && textPosition !== 'bottom') textPosition = 'bottom';

        let idOrder = idPosition === 'bottom' ? 2 : (idPosition === 'middle' ? 1 : 0);
        let iconOrder = iconPosition === 'bottom' ? 2 : (iconPosition === 'middle' ? 1 : 0);
        let textOrder = textPosition === 'bottom' ? 2 : (textPosition === 'middle' ? 1 : 0);

        let pos = Object.entries({id: idOrder, icon: iconOrder, text: textOrder});
        pos.sort((a, b) => a[1] < b[1] ? -1 : 1);
        pos = Object.fromEntries(pos
            .map((obj) => shown[obj[0]] === true ? obj[0] : null)
            .filter((key) => key !== null)
            .map((obj, idx) => [obj, {order: idx}])
        );

        if (!pos.id) pos = {...pos, id: {display: 'none'}};
        if (!pos.icon) pos = {...pos, icon: {display: 'none'}};
        if (!pos.text) pos = {...pos, text: {display: 'none'}};

        return pos;
    }, [data, shown]);

    const iconColor = useMemo(() => {
        try {
            const rgb = hexToRgb(data?.icon?.color ?? "#000000");
            if (rgb.length === 3) {
                const color = new Color(rgb[0], rgb[1], rgb[2]);
                const solver = new Solver(color);
                const result = solver.solve();
                return result.value;
            }
            return "initial";
        } catch {
            return "initial";
        }
    }, [data]);

    const idLineCount = useMemo(() => {
        try {
            let lineCount = parseInt(data?.id?.lineCount ?? "1");
            if (lineCount < 1) return 1;
            return lineCount;
        } catch {
            return 1;
        }
    }, [data]);

    const textLineCount = useMemo(() => {
        try {
            let lineCount = parseInt(data?.text?.lineCount ?? "1");
            if (lineCount < 1) return 1;
            return lineCount;
        } catch {
            return 1;
        }
    }, [data]);

    const styles = useMemo(() => ({
        id: {
            ...positions.id,
            width: "calc(100% - 2mm)",
            height: "max-content",
            padding: "1mm",
            paddingTop: positions.id.order === 0 ? "2mm" : "1mm",
            paddingBottom: positions.id.order === shownCount - 1 ? "2mm" : "1mm",
            flex: (data?.id?.fullHeight === true ? 1 : "initial"),
            backgroundColor: (data?.id?.backgroundColor ?? "transparent"),
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "center",
            alignItems: "center",
        },
        idContent: {
            "--idlh": "1.2em",
            "--idnbl": idLineCount,
            margin: 0,
            padding: 0,
            display: "-webkit-box",
            WebkitLineClamp: "var(--idnbl)",
            WebkitBoxOrient: "vertical",
            /*"-webkit-line-clamp": "var(--idnbl)",
            "-webkit-box-orient": "vertical",*/
            overflow: "hidden",
            lineHeight: "var(--idlh)",
            height: "calc(var(--idlh) * var(--idnbl))",
            textAlign: (data?.id?.horizontalAlignment ?? "center"),
            fontSize: (data?.id?.fontSize ?? "2.4mm"),
            fontWeight: (data?.id?.fontWeight ?? "bold"),
            fontStyle: (data?.id?.fontStyle ?? "normal"),
            fontFamily: (data?.id?.fontFamily ?? "sans-serif"),
            color: (data?.id?.color ?? "#000000"),
            backgroundColor: (data?.id?.backgroundColor ?? "transparent"),
            width: "100%",
        },
        icon: {
            ...positions.icon,
            width: "calc(100% - 2mm)",
            height: `calc((${style['--h']} * ${(((data?.icon?.sizePercent ?? 50) * 0.15) / 100) + 0.15}))`, // min 0.15 max 0.30
            padding: "1mm",
            paddingTop: positions.icon.order === 0 ? "2mm" : "1mm",
            paddingBottom: positions.icon.order === shownCount - 1 ? "2mm" : "1mm",
            flex: (data?.icon?.fullHeight === true ? 1 : "initial"),
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: (data?.icon?.horizontalAlignment ?? "center"),
            backgroundColor: (data?.icon?.backgroundColor ?? "transparent"),
        },
        iconImg: {
            minHeight: `calc(${style['--h']} * ${(((data?.icon?.sizePercent ?? 50) * 0.15) / 100) + 0.15})`, // min 0.15 max 0.30
            maxHeight: `calc(${style['--h']} * ${(((data?.icon?.sizePercent ?? 50) * 0.15) / 100) + 0.15})`, // min 0.15 max 0.30
            width: `calc(${style['--h']} * ${(((data?.icon?.sizePercent ?? 50) * 0.15) / 100) + 0.15})`, // min 0.15 max 0.30
            aspectRatio: "auto",
            filter: iconColor,
        },
        text: {
            ...positions.text,
            width: "calc(100% - 2mm)",
            height: "max-content",
            padding: "1mm",
            paddingTop: positions.text.order === 0 ? "2mm" : "1mm",
            paddingBottom: positions.text.order === shownCount - 1 ? "2mm" : "1mm",
            flex: (data?.text?.fullHeight === true ? 1 : "initial"),
            backgroundColor: (data?.text?.backgroundColor ?? "transparent"),
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "center",
            alignItems: "center",
        },
        textContent: {
            "--textlh": "1.1em",
            "--textnbl": textLineCount,
            margin: 0,
            padding: 0,
            display: "-webkit-box",
            WebkitLineClamp: "var(--textnbl)",
            WebkitBoxOrient: "vertical",
            /*"-webkit-line-clamp": "var(--textnbl)",
            "-webkit-box-orient": "vertical",*/   /* Orientation vertical de la boite */
            overflow: "hidden",
            lineHeight: "var(--textlh)",
            height: "calc(var(--textlh) * var(--textnbl))",
            textAlign: (data?.text?.horizontalAlignment ?? "center"),
            fontSize: (data?.text?.fontSize ?? "2.7mm"),
            fontWeight: (data?.text?.fontWeight ?? "bold"),
            fontStyle: (data?.text?.fontStyle ?? "normal"),
            fontFamily: (data?.text?.fontFamily ?? "sans-serif"),
            color: (data?.text?.color ?? "#000000"),
            backgroundColor: (data?.text?.backgroundColor ?? "transparent"),
            width: "100%",
        }
    }), [data, positions]);

    return (<>

        {shown.id && <div style={styles.id} data-order={positions.id.order === 0 ? 'top' : (positions.id.order === shownCount - 1 ? 'bottom' : 'middle')}>
            <p style={styles.idContent}>{item.id}</p>
        </div>}

        {shown.icon && <div style={styles.icon} data-order={positions.icon.order === 0 ? 'top' : (positions.icon.order === shownCount - 1 ? 'bottom' : 'middle')}>
            {item.icon && <img
                style={styles.iconImg}
                alt="Pictogramme"
                src={`${import.meta.env.VITE_APP_BASE}${item.icon}`}
            />}
        </div>}

        {shown.text && <div style={styles.text} data-order={positions.text.order === 0 ? 'top' : (positions.text.order === shownCount - 1 ? 'bottom' : 'middle')}>
            <p
                style={styles.textContent}
                dangerouslySetInnerHTML={{__html: item.text.replaceAll("\n", "<br />")}}
            ></p>
        </div>}

    </>);
}

export default CustomTheme;