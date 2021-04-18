const CommentIcon = ({user, usersAvatars=[]})=>{

    // console.log(usersAvatars)
    // alert(usersAvatars)

    return(
        <div style={{marginBottom: '1.5vh'}}>
            {
                usersAvatars.map((item, i)=>{
                    // alert(item.user)
                    return item.user === String(user).trim().toLowerCase() ?
                        (
                            <div key={i} className={'icon-user-main-container'}
                                 style={{
                                     position: 'relative'
                                 }}
                            >
                                <div className={'icon-container'} style={{
                                    width: '30px',
                                    height: '30px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '50%',
                                    margin: '0 0 0 5%'
                                }}>
                                    <img src={item.filepath} style={{
                                        display: 'block',
                                        position: 'absolute',
                                        height: '100%',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        // border: '2px solid red'
                                    }}
                                         alt={''}/>
                                </div>
                                <div className={'user-name'} style={{
                                    // border: '1px solid red',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)'

                                }}>{String(user).trim().toLowerCase()}</div>
                            </div>
                        ) :
                            (
                                <div key={i}>
                                </div>
                            )
                })
            }
        </div>
    )
}

export default CommentIcon