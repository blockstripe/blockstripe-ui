import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './assets/index.css';

window.onload = async () => {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
};
