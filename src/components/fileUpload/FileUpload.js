import React, {useState, useEffect, useRef} from 'react'

import {getAvatar, handleSubmit} from "../fetch/Fetch";
import {handleUpload} from "../../lib/helper/helper";
import {useHydration} from "../../HydrateSocket";

const FileUpload = ({user})=>{
    const{app: { avatar }, setAvatar}=useHydration()
    const [handleOnchange, _, reset] = handleUpload('Choose file:')

    useEffect(()=>{
        console.log(user)
        getAvatar(user, setAvatar)
    },[])

    return (
        <div style={{
                 // border: '2px solid black'
             }}
        >
            {avatar.filepath && <div className={'image-container'} style={{
                // border: '2px solid green',
                width: '100px',
                height: '100px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '50%',
                margin: 'auto'
            }}>
                <img style={{
                    display: 'block',
                    position: 'absolute',
                    height: '100%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    // border: '2px solid red'
                }} src={avatar.filepath} alt={''}/>
            </div>}
            <form onSubmit={
                (e)=>
                    handleSubmit({e, _, setAvatar, reset})}
                    encType={"multipart/form-data"}
                    style={{textAlign: "center"}}>
                <label>
                    {_.filename}
                    {' '}
                    <input
                        {...handleOnchange}
                        type={'file'}
                        name={'photo'}
                        className={'upload'}
                        style={{display: 'none'}}
                        accept={'image/png, image/jpeg'}
                    />
                    <div style={{cursor: 'pointer', backgroundColor: 'grey', borderRadius: '3px'}}>brows</div>
                </label>
                <input type={'hidden'} name={'user'} value={user}/>
                <input type={'hidden'} name={'fullPath'} value={avatar.fullPath}/>
                <input type={'hidden'} name={'pathToDir'} value={avatar.pathToDir}/>
                <hr/>
                <button>Save</button>
            </form>
            <hr/>
        </div>
    );
}

export default FileUpload