import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';

function Footer() {
    return <div style={{ marginTop: '1em', fontSize: 'small', color: 'darkgray' }} className='footer'>{pkg.title} {pkg.version}<span className="not_printable"> | <a href={pkg.repository.url} style={{ color: 'darkcyan' }} target="_blank">{pkg.repository.url}</a> | {`Licence ${pkg.license}`} | {pkg.author} (pantaflex44) | 2024</span></div>;
}

export default function Main() {
    return (
        <React.StrictMode>
            <App />
            <Footer />
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
