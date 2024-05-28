import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'

import './main.css';
import favicon from '../public/favicon.svg';

export default function Main() {
  useEffect(() => {
    document.title = `Nouveau projet - ${import.meta.env.VITE_APP_NAME} ${import.meta.env.VITE_APP_VERSION}`;
  }, []);

  

  return (
    <React.StrictMode>
      <main>
        <h1><img src={favicon} width={32} height={32} alt="Tiquettes" /><span>{import.meta.env.VITE_APP_NAME}</span><sup className="version">{import.meta.env.VITE_APP_VERSION}</sup></h1>
        <h6>by pantaflex44</h6>
        <App />
        <div style={{ marginTop: '5em', marginBottom: '2em', fontSize: 'small', color: 'darkgray' }} className='footer'>{import.meta.env.VITE_APP_NAME} {import.meta.env.VITE_APP_VERSION} | <a href="https://github.com/pantaflex44/Tiquettes" target="_blank">https://github.com/pantaflex44/Tiquettes</a> | Licence MIT | Christophe LEMOINE (pantaflex44) | 2024</div>
      </main>
    </React.StrictMode>)
    ;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
