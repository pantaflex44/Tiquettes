import { useState, useEffect } from 'react';

function useMultiClickHandler(handler, delay = 250) {
    const [state, setState] = useState({ clicks: 0, args: [] });

    useEffect(() => {
        const timer = setTimeout(() => {
            setState({ clicks: 0, args: [] });

            if (state.clicks > 0 && typeof handler[state.clicks] === 'function') {
                handler[state.clicks](...state.args);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [handler, delay, state.clicks, state.args]);

    return (...args) => {
        setState((prevState) => ({ clicks: prevState.clicks + 1, args }));

        if (typeof handler[0] === 'function') {
            handler[0](...args);
        }
    };
}

export default useMultiClickHandler;