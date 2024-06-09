import { useEffect, useState } from 'react';

// eslint-disable-next-line react/prop-types
function ContentEditable({ value = "", onChange = null, style = {}, editableStyle = {}, editableClassName = null, className = null, editMode = false, editable = true, height = 28 }) {
    const [edit, setEdit] = useState(editMode);
    const [lastContent, setLastContent] = useState(value);
    const [content, setContent] = useState(value);

    useEffect(() => {
        setEdit((old) => {
            if (!editable) return false;

            if (old !== editMode) return editMode;

            return old;
        });
    }, [editMode, editable]);

    useEffect(() => {
        setLastContent(value);
    }, [value]);

    const handleEdit = () => {
        setContent(lastContent);
        setEdit(editable);
    };

    const handleCancel = () => {
        setEdit(false);
    };

    const handleOk = () => {
        setLastContent(content);
        if (onChange) onChange(content);

        setEdit(false);
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Escape') handleCancel();
        else if (e.key === 'Enter') handleOk();
    };

    const handleChange = (e) => {
        setContent(e.target.value);
    };

    return (
        <div tabIndex={0} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'start', alignItems: 'center', columnGap: '0.5em' }} onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) handleCancel();
        }}>
            {edit && editable
                ? <input type="text" value={content} onChange={handleChange} onKeyUp={handleKeyUp} style={{ height: `${height}px`, ...editableStyle }} className={editableClassName} autoFocus />
                : <span style={{ ...style }} className={className} onClick={() => { if (editable) handleEdit(); }} title="Cliquer sur le texte pour le modifier">
                    {value}
                </span>
            }
        </div>
    );
}

export default ContentEditable;