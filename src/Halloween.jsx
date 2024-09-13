import './halloween.css';

function Halloween() {
    const currentDate = new Date().toJSON().slice(0, 10);
    const from = new Date(new Date().getFullYear(), 9, 29); // 29 octobre
    const to = new Date(new Date().getFullYear(), 10, 2); // 2 novembre
    const check = new Date(currentDate);

    const isHalloween = check >= from && check <= to;

    return isHalloween
        ? (
            <div className="halloween">
                <div className="spider">
                    <div className="spiderweb"></div>
                    <div className="body">
                        <div className="eye left"></div>
                        <div className="eye right"></div>
                    </div>
                    <div className="legs left">
                        <div className="leg"></div>
                        <div className="leg"></div>
                        <div className="leg"></div>
                    </div>
                    <div className="legs right">
                        <div className="leg"></div>
                        <div className="leg"></div>
                        <div className="leg"></div>
                    </div>
                </div>
                <div className="chaud">
                    <div className="group">
                        <div className="main">
                            <div className="shade"></div>
                        </div>
                        <div className="legs"></div>
                        <div className="rim"></div>
                        <div className="bubbles"></div>
                        <div className="broom"></div>
                        <div className="shadow"></div>
                    </div>
                </div>
            </div>
        )
        : null;
}

export default Halloween;