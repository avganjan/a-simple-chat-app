import React, {useState, useEffect} from 'react';

import "./styles/App.css"

import Join from "./components/join/Join";
import Chat from "./components/chat/Chat"
import Authorization from "./components/authorization/Authorization";
import RoomsList from "./components/roomslist/RoomsList";
import Notification from "./components/notification/Notification";
import AnimatedCallback from "./components/animatedCallback/AnimatedCallback";
import FileUpload from "./components/fileUpload/FileUpload";
import { setChatRoom, getRoomsList, getRequestNotifications, sendPermission } from "./components/fetch/Fetch";

import {setLocStorage} from "./lib/helper/helper";

import{useHydration} from "./HydrateSocket";

const App = () => {
    //use Provider
    const{
        setPermiss,
        authorize,
        app,
        chat,
        setRoomsList,
        setNoteList,
        setRequest
    } = useHydration()

    const { roomsList , noteList, conjoin, access, notification, permitObj } = app
    const { permission } = authorize

    const[ show, setShow ]=useState(false)

    useEffect(()=>{

        if (notification.room){
            // console.log(request)
            setRequest(notification)
        }
    },[conjoin.room])

    useEffect(()=>{
        setLocStorage(permission, setPermiss)
    },[permission.authorized])


    useEffect(()=>{
        setChatRoom({chat, permission, setRoomsList})
    }, [chat])

    useEffect(()=>{
        if (!roomsList.room){
            getRoomsList(setRoomsList)
        }
    },[])

    useEffect(()=>{
        getRequestNotifications(permission, setNoteList)
    },[permission.name])

    useEffect(()=>{
        if (permitObj.deny || permitObj.permit){
            sendPermission(permitObj, permission, setNoteList)
        }
    },[permitObj.deny, permitObj.permit])

    if (!permission.authorized && !localStorage.getItem("permission")) return <Authorization/>

    return (
      <div className={'main'}>
          <div className={"file-upload"}>
              { permission.name && <FileUpload user={permission.name}/> }
              {
                  roomsList.room ?
                      <RoomsList show={show} setShow={setShow} name={permission.name}/> :
                      null
              }
          </div>
          {/*<AnimatedCallback/>*/}
          <div className={'app'}>
              { noteList && <Notification/> }
              { !access.room ? <Join/> : null }
              { conjoin ? <Chat room={conjoin} name={permission.name}/> : null }
          </div>
      </div>
  );
}

export default App;
