import React, {useState, useEffect, useRef} from "react"
import "./../../styles/Notification.css"
import {useHydration} from "../../HydrateSocket";

const Notification = ()=>{
    const[button, setButton]=useState(false)
    const[listHeight, setListHeight]=useState(null)
    const NoteList = useRef()
    const {setPermitObj, app} = useHydration()
    const {noteList:{list, count}, roomsList} = app

    return(
        <div className={'notification-main'}>
            {roomsList.room && <div className={"create-new-room-container"} style={{float: 'right'}}
            >
                <div onClick={() => {
                    location.reload()
                }}>create room
                </div>
            </div>
            }

            <div className={'notification-container'}>
                <div className={'notification-button'}
                     onClick={()=>{
                         setButton(!button)
                         setListHeight(NoteList.current.scrollHeight)
                     }}
                >
                    Notifications {count}
                </div>
                <div className={'notification-list'}
                     ref={NoteList}
                     style={{maxHeight: button ? listHeight : 0}}
                >
                    {
                        list.length ?
                            list.map(({room, admin, applicant}, i)=>{
                                return (
                                    <div className={'notification-box'} key={i}>
                                        {applicant} wants to join {room}
                                        <div className={'notification-box-container'}>
                                            <div className={'notification-box-container-permit'}
                                                onClick={(e)=>{
                                                e.stopPropagation()
                                                setPermitObj({deny: false, permit: {room, admin, applicant}})
                                                setButton(false)
                                            }}>permit</div>
                                            <div className={'notification-box-container-deny'}
                                                onClick={(e)=>{
                                                e.stopPropagation()
                                                setPermitObj({deny: true, permit: null})
                                                setButton(false)
                                            }}>deny</div>
                                        </div>
                                    </div>
                                )
                            })
                            :
                            ""
                    }
                </div>
            </div>
        </div>
    )
}

export default Notification