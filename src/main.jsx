import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';

import Halloween from './Halloween.jsx';

function Footer() {
    return <div style={{ marginTop: '1em', fontSize: 'small', color: 'darkgray' }} className='footer'>{pkg.title} {pkg.version}<span className="not_printable"> | <a href={pkg.repository.url} style={{ color: 'var(--primary-color)' }} target="_blank" rel="noopener">{pkg.repository.url}</a> | <a href="./LICENSE" title="Licence" style={{ color: 'var(--primary-color)' }} target="_blank" rel="noopened">{`Licence ${pkg.license}`}</a> | <a href={pkg.author.url} title="Portfolio" style={{ color: 'var(--primary-color)' }} target="_blank" rel="noopened">{pkg.author.name} (pantaflex44)</a> | 2024</span></div>;
}

export default function Main() {
    return (
        <React.StrictMode>
            <App />
            <Footer />

            <Halloween />

        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
