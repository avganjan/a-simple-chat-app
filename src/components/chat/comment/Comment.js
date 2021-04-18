import React, {useRef, memo, useMemo} from "react"
import ScrollToBottom from "react-scroll-to-bottom"

import Box from "./Box";
import "../../../styles/Comment.css"

const Comments = ({room, comments, usersAvatars, deletedUsers})=>{

    // alert("usersAvatars - " + JSON.stringify(usersAvatars))

    const deletedList = useMemo(()=> {
        return deletedUsers
    })
    // console.log(deletedList)

    return(
        <ScrollToBottom className={'comments-main'}>
            <div className={'comments-container'}>
                {/*{room && room.room}*/}
                {/*<h3>Here must be listed the users withe their comments</h3>*/}
                {comments.map(({message, user}, i)=>{
                    return(
                        <div className={'comments-box'} key={i}>
                            <Box deletedList={deletedList} user={user} message={message} usersAvatars={usersAvatars} />
                        </div>
                    )
                })}
            </div>
        </ScrollToBottom>
    )
}

export default Comments