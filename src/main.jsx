import React from 'react';import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider,Protected} from './auth.jsx';
import Landing from './pages/Landing.jsx';import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';import Session from './pages/Session.jsx';
import './styles.css';
createRoot(document.getElementById('root')).render(
<AuthProvider><BrowserRouter><Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/login" element={<Auth mode="login"/>}/><Route path="/signup" element={<Auth mode="signup"/>}/>
  <Route path="/app" element={<Protected><Dashboard/></Protected>}/>
  <Route path="/app/:subjectId" element={<Protected><Dashboard/></Protected>}/>
  <Route path="/session/:id" element={<Protected><Session/></Protected>}/>
  <Route path="*" element={<Navigate to="/"/>}/>
</Routes></BrowserRouter></AuthProvider>);
