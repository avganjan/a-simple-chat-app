import React, {useState, useEffect, useRef} from "react"
import io from "socket.io-client";
import uuid from "react-uuid"

import "../../styles/Chat.css"
import Comment from "./comment/Comment";
import {getRoomsList, getRequestNotifications} from "../fetch/Fetch";
import {setField} from "../../lib/helper/helper";
import {useHydration} from "../../HydrateSocket";

const socket = io("http://localhost:4040", {transports: ['websocket']})

const Chat = ({ room, name })=>{
    const[removed, setRemoved]=useState(null)
    const[set, reset]=setField('')
    const[rows, setRows]=useState(0)
    const[message, setMessage]=useState('')
    const[id, setID]=useState('')
    const[comments, setComments]=useState([])
    const[, setPrevRoom]=useState(null)
    const[usersAvatars, setUsersAvatars]=useState([])
    const textArea = useRef()

    //using provider
    const {setRoomsList, setNoteList, app, authorize, setAccess, setRequestCallback} = useHydration()
    const {access, request} = app
    const {permission} = authorize

    useEffect(()=>{
        socket.on("connect", ()=>{
            socket.Buffer = []
        })
    }, [])

    useEffect(()=>{

            setPrevRoom((prev)=>{
                if (!prev){
                    socket.emit("join", {...room, id: socket.id, admin: name, prev: ''}, resp=>{
                        // console.log(resp)
                    })
                    return {room: room.room, id: socket.id}
                }
                if (prev){
                    socket.emit("join", {...room, id: socket.id, admin: name, prev}, resp=>{
                        // console.log(resp)
                    })
                    return {room: room.room, id: socket.id}
                }

            })
    }, [room.room])

    useEffect(()=>{
        socket.on("user left room", (name, id)=>{
            console.log(name + " with id " + id + " has left the chat...")
        })
    }, [room.room])

    useEffect(()=>{
        socket.on("user joined room", (name, id, room)=>{
            console.log(name + " with id " + id + " has joined the chat...")
        })
    }, [room.room])

    useEffect(()=>{
        if (message){
            console.log("store messages")
            socket.emit("store messages", message, room.room, name)
        }
    }, [id])

    useEffect(()=>{
        socket.on("stored  messages", (comments, photoData)=>{
            setComments(comments)
            setUsersAvatars(photoData)
        })
    }, [room.room])

    useEffect(()=>{
        if (request.room){
            socket.emit("applicant request", request, {id: socket.id, admin: name}, resp =>{
                setRequestCallback(resp)
            })
        }
    },[request.room])

    // useEffect(()=>{
    //     socket.on("notification", notify=>{
    //         if (notify){
    //             // console.log(notify)
    //             // alert(JSON.stringify(notify))
    //         }
    //     })
    // },[request.room])

    useEffect(()=>{
        socket.emit("initial messages", room.room, room.close, room.users, name, ({comments, photoData, room, bool}) =>{

            if (bool){
                setAccess({valid: bool, room: room, disabled: false})
                setComments(comments)
                setUsersAvatars(photoData)
            }
            if (!bool){
                setAccess({valid: bool, room: room, disabled: true})
                setComments([])
                // setUsersAvatars([{user: '', filepath: ''}])
                setUsersAvatars(photoData)
            }
        })
    }, [room.room])

    useEffect(()=>{
        // alert(room.room)
        getRoomsList(setRoomsList)
        getRequestNotifications(permission, setNoteList)
    },[room.room])

    return(
        <div className={'chat-main'} style={{display: access.disabled ? "none":""}} onClick={(e)=>{
            setRows(0)
        }}
        >
            {removed && <div>{removed.name} left the chat...</div>}
            {room && <div>Event's name is - {room.room}</div>}

            {comments.length && !access.disabled ? <Comment
                room={room} comments={comments} usersAvatars={usersAvatars}
                // deletedUsers={deletedList}
                />
                : null}

            <div className={'chat-form-container'}>
                <form className={'chat-form'} onSubmit={(e)=>{
                    e.preventDefault()
                    setMessage(textArea.current.value)
                    setID(uuid())
                    textArea.current.value = ''

                }}>
                    <div className={'chat-form-div-textarea'}>
                        <textarea ref={textArea} style={{resize: "none", display: access.disabled ? "none": ""}} rows={rows}
                                  onClick={(e)=>{
                                      e.stopPropagation()
                                      setRows(3)
                                  }}
                                  placeholder={'Write a message...'}/>
                    </div>
                    <div className={'chat-form-div-button'}>
                        <button onClick={e=>{e.stopPropagation()}} style={{display: access.disabled ? "none":""}}>send</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Chat