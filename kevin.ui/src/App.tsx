import React from 'react';
import logo from './images/logo.png';
import Divider from '@mui/material/Divider';
import  './App.css';
import { EnvironmentsTree } from './features/environments/environmentsTree';
import { useAppDispatch } from './app/hooks';
import { loadEnvironments } from  './features/environments/environmentsSlice';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { EnvironmentInfo } from './features/environmentInfo/environmentInfo';
function App() {

  const dispatch = useAppDispatch();
  dispatch(loadEnvironments());
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        </header>
      <Divider></Divider>
        <div className="app-content">
        
        <EnvironmentsTree />
        <div className="verticalDivider"></div>
        <EnvironmentInfo />
        
     </div>
    </div>
  );
}

export default App;
