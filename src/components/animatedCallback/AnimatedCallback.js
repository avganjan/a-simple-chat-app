import "../../styles/AnimatedCallback.css"
import {useHydration} from "../../HydrateSocket";

const AnimatedCallback=()=>{
    const {app: { requestCallback: { message, status } }} = useHydration()
    return(
        <div className={"animated-callback-container"}>
            <div>
                {message && !status ?
                    message :
                    !message && status ?
                        "you successfully sent the request" :
                        null
                }
            </div>
        </div>
    )
}

export default AnimatedCallback