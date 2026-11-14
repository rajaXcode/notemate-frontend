import {createContext,useContext,useEffect,useState} from 'react';
import {Navigate} from 'react-router-dom';
const Ctx=createContext(null);
export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('nm_u')||'null'));
  const login=d=>{localStorage.setItem('nm_t',d.token);localStorage.setItem('nm_u',JSON.stringify(d.user));setUser(d.user)};
  const logout=()=>{localStorage.removeItem('nm_t');localStorage.removeItem('nm_u');setUser(null)};
  useEffect(()=>{window.addEventListener('nm-logout',logout);return()=>window.removeEventListener('nm-logout',logout)},[]);
  return <Ctx.Provider value={{user,login,logout}}>{children}</Ctx.Provider>;
}
export const Protected=({children})=>useAuth().user?children:<Navigate to="/login" replace/>;
