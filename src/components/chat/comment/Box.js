import React from "react"

import CommentIcon from "./CommentIcon";
import "../../../styles/Box.css"

const Box = ({ user, message, usersAvatars})=>{
    return(
        <div className={'box-main'}>
            <CommentIcon user={user} usersAvatars={usersAvatars}/>
            <p style={{margin: 0}}>{message}</p>
        </div>
    )
}

export default Box