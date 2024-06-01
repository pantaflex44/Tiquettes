import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import * as pkg from '../package.json';
import favicon from '../public/favicon.svg';

export default function Main() {
    useEffect(() => {
        document.title = `Nouveau projet - ${pkg.title} ${pkg.version}`;
    }, []);



    return (
        <React.StrictMode>
            <main>
                <h1><img src={favicon} width={32} height={32} alt="Tiquettes" /><span>{pkg.title}</span><sup className="version">{pkg.version}</sup></h1>
                <h6>by pantaflex44</h6>
                <h3 className='description'>{pkg.description}</h3>
                <App />
                <div style={{ marginTop: '5em', marginBottom: '2em', fontSize: 'small', color: 'darkgray' }} className='footer'>{pkg.title} {pkg.version} | <a href={pkg.repository.url} target="_blank">{pkg.repository.url}</a> | Licence {pkg.license} | {pkg.author} (pantaflex44) | 2024</div>
            </main>
        </React.StrictMode>)
        ;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
