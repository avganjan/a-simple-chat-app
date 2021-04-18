import React from "react";

import {useHydration} from "../../HydrateSocket";

//from Authorization
export const submitPass = ({e, login, pass, setRes})=> {
    e.preventDefault()

    console.log('Fetch')
    // alert('stop')
    if (login && pass){
        fetch(`/api/login/pass/set`,
            {
                method: 'post',
                body: JSON.stringify({ login, pass }),
                headers: { 'Content-Type': 'application/json' }
            }
        ).
        then(res=> res.json()).
        then((res)=>{
            if(res.status < 200 || res.status > 299)
                return alert('We had a problem processing this...please try again.')
            // console.log(res)
            setRes(res)
        })
    }else{
        alert("login and password required")
    }
}

export const submitLogin = (e, login, pass, logResp)=>{
    // alert(JSON.stringify(login))
    if (login && pass){
        fetch('/api/log/in',
            {
                method: 'post',
                body: JSON.stringify({ login, pass }),
                headers: { 'Content-Type': 'application/json' }
            }).
        then(res=> res.json()).
        then(res=>{
            if(res.status < 200 || res.status > 299)
                return alert('We had a problem processing this...please try again.')
            logResp(res)
        })

        e.preventDefault()
    }else {
        alert('login and password required')
    }
}

export const getAvatar = (user, setAvatar)=>{
    fetch('/api/get/default/avatar',
        {
            method: 'post',
            body: JSON.stringify({user}),
            headers: { 'Content-Type': 'application/json' }
        }).
    then(res => res.json()).
    then(res=>{
        if(res.status < 200 || res.status > 299)
            return alert("We had a problem processing this...please try again.")
        // console.log(res)
        if (!res.filepath) return console.log("No files exist!")
        setAvatar(res)
    })
}

export const handleSubmit = ({e, _, setAvatar, reset})=>{
    e.preventDefault()

    const body = new FormData(e.target)

    if ('Choose file:' ===  _.filename || 'File uploaded' === _.filename){
        alert("You have not chosen any file!")
    }

    if ('Choose file:' !== _.filename){
        fetch('/api/avatar/image', { method: 'post', body })
            .then(resp => {
                if(resp.status < 200 || resp.status >= 300)
                    throw new Error(`Request failed with status ${resp.status}`)
                return resp.json()
            }).then((res)=>{
            // console.log(res)
            if (res){
                setAvatar(res)
                reset()
            }
        }).catch(err => {
            console.log("Something goes wrong")
        })
    }
}

export const setChatRoom = ({chat, permission, setRoomsList})=>{
    // alert(JSON.stringify(room))
    if (chat.room){
        fetch('/api/chat/user/room/set',
            {
                method: "post",
                body: JSON.stringify({ room: chat.room, close: chat.close, name: permission.name }),
                headers: { 'Content-Type': 'application/json' }
            }).
        then(res=>res.json()).
        then(res=>{
            if(res.status < 200 || res.status > 299)
                return alert("We had a problem processing this...please try again.")
            console.log(res)
            setRoomsList({room: res.room, err: res.err})

        })
    }
}

export const getRoomsList = (setRoomsList)=>{
    fetch("/api/get/rooms/list",
        {
            method: "post",
            body: JSON.stringify({ req: "An request from client for rooms list..." }),
            headers: { 'Content-Type': 'application/json' }
        }
    ).
    then(res=>res.json()).
    then(res=>{
        if(res.status < 200 || res.status > 299)
            return alert("We had a problem processing this...please try again.")
        // console.log(res)

        setRoomsList(res)
    })
}

export const getRequestNotifications = (permission, setNoteList)=>{
    if (permission.name){
        fetch("/api/get/notifications/list",
            {
                method: "post",
                body: JSON.stringify({ req: "An request from client for notifications list..." , admin: permission.name}),
                headers: { 'Content-Type': 'application/json' }

            }
        ).
        then(resp=>resp.json()).
        then(resp=>{
            if(resp.status < 200 || resp.status > 299)
                return alert("We had a problem processing this...please try again.")
            // console.log("getRequestNotifications - " + JSON.stringify(resp))
            // alert("getRequestNotifications - " + JSON.stringify(resp))
            setNoteList(resp)
        })
    }
}

export const sendPermission = (permit, permission, setNoteList)=> {
    fetch("/api/sent/permit/data",
        {
            method: "post",
            body: JSON.stringify({...permit}),
            headers: {'Content-Type': 'application/json'}

        }).
    then(resp => resp.json()).
    then(({resp}) => {
        if (resp.status < 200 || resp.status > 299)
            return alert("We had a problem processing this...please try again.")
        if (resp){
            if (resp.nModified){
                console.log("refresh note list...")
                getRequestNotifications(permission, setNoteList)
            }
        }
    })
}