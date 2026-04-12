import { useEffect, useState } from 'react';


/**
 * Confirm browser exit.
 *
 * @param defaultEnabled Start as enabled?
 * @param message Custom message (old browsers only).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 */
export const useConfirmBrowserExit = (
    defaultEnabled = true,
    message = 'Confirm leave page'
) => {
    const [msg, setMsg] = useState(message);
    const [enabled, setEnabled] = useState(defaultEnabled);

    useEffect(() => {
        function listener(e) {
            if (enabled) {
                e.preventDefault();
                e.returnValue = msg;
                return msg;
            }
        }

        window.addEventListener('beforeunload', listener);

        return () => {
            window.removeEventListener('beforeunload', listener);
        };
    }, [msg, enabled]);

    return {
        enable() {
            setEnabled(true);
        },
        disable() {
            setEnabled(false);
        },
        setMessage(newMessage) {
            setMsg(newMessage);
        },
        getMessage() {
            return msg;
        },
        setEnabled(status) {
            setEnabled(status);
        },
        getEnabled() {
            return enabled;
        },
    };
};