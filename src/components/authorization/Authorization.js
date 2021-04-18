import React, {useState, useEffect} from "react"

import Login from "./Login";

import {submitPass} from "../fetch/Fetch";
import {useHydration} from "../../HydrateSocket";

const Authorization = ()=>{
    const {
        setPermiss,
        authorize,
        // login,
        setLog,
        // pass,
        setPas,
        // response,
        setRes
    } = useHydration()
    const {login, pass, response} = authorize

    // console.log(response.authorized)
    useEffect(()=>{
        setPermiss(response)
    }, [response.authorized])

    return(
        <div>
            <h3 style={{textAlign: "center"}}>
                Register or log in, if registered
            </h3>
            { !response.err ? <div>{response.users.log_pass.map(({login, password}, i) => {
                return (
                    <p key={i}>
                        Login is - {login}, the password - {password}
                    </p>
                )
            })}
            </div> :
                <p style={{textAlign: "center"}}>
                    {response.err}
                </p>
            }
            <div>
                <Login/>
            </div>
            <div className={'login-form'}>
                <h3>Register</h3>
                <form onSubmit={(e)=>submitPass({e, login, pass, setRes})}>
                    <input type={'text'} onChange={(e)=>{
                        setLog(e.target.value)
                    }}/>
                    <input type={'text'} onChange={(e)=>{
                        setPas(e.target.value)
                    }}/>
                    <button>
                        Register
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Authorization