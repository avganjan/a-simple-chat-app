import React, {useState, useEffect, useLayoutEffect} from "react"

import {setField} from "../../lib/helper/helper";
import "../../styles/Join.css"
import {useHydration} from "../../HydrateSocket";

const Join = ()=>{
    const[check, setCheck] = useState(false)
    const[set, reset]=setField('')
    const {getRoom} = useHydration()

    return(
        <div className={'join-man'}>
            <div className={'join-container'}>
                <div className={'join-inputs-container'}>
                    <input type={'text'} {...set} />
                    <label>
                        make room privat:
                        <input type={'checkbox'} onChange={()=>{
                            setCheck(!check)
                        }} checked={check}/>
                    </label>
                </div>
                <div className={'join-link-container'}>
                    <button className={'join-link-button'} onClick={(e)=>{
                        if (set.value){
                            getRoom({room: set.value, close: check})
                            setCheck(false)
                            reset()
                        }else {
                            alert("insert room name")
                        }
                    }}>
                        Create room
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Join