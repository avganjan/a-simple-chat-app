import React, {useState, useEffect} from 'react'

import {submitLogin} from "../fetch/Fetch";
import {useHydration} from "../../HydrateSocket";

const Login = ()=>{
    // const[login,setLogin]=useState('')
    // const[pass,setPass]=useState('')
    // const[response,setResponse]=useState({err:  null, authorized: false, name: ''})

    const{
        login,
        // login_login,
        logName,
        // pass_login,
        logPass,
        // res_login,
        logResp,
        setPermiss
    }=useHydration()

    const {login_login, pass_login, res_login} = login

    // console.log('login' + login_login)
    // console.log('pass' + pass_login)

    useEffect(()=>{
        setPermiss(res_login)
    },[res_login.authorized])

    // const Submit = (e)=>{
    //
    //     if (login_login && pass_login){
    //         fetch('/api/log/in',
    //             {
    //                 method: 'post',
    //                 body: JSON.stringify({ login: login_login, pass: pass_login }),
    //                 headers: { 'Content-Type': 'application/json' }
    //             }).
    //         then(res=> res.json()).
    //         then(res=>{
    //             if(res.status < 200 || res.status > 299)
    //                 return alert('We had a problem processing this...please try again.')
    //             logResp(res)
    //         })
    //
    //         e.preventDefault()
    //     }else {
    //         alert('login and password required')
    //     }
    // }

    //console.log(response)

    return(
        <div>
            <h3>Login</h3>
            <p>{res_login.err && res_login.err}</p>
            <div>
                <form onSubmit={(e)=>{
                    submitLogin(e,login_login, pass_login, logResp)
                }}>
                    <input type={'text'} onChange={(e)=>{logName(e.target.value)}} />
                    <input type={'text'} onChange={(e)=>{logPass(e.target.value)}} />
                    <button>Log in</button>
                </form>
            </div>
        </div>
    )
}

export default Login