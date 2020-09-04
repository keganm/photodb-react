import React,{useState, useEffect} from 'react';
import {gapi,loadAuth2} from 'gapi-script';
import { Button } from 'antd';


function GoogleLogin(props){


    const updateUserCallback = props.setnewuser;

    const [user,setUser] = useState(null);
    const [isReady,setIsReady] = useState(false);


    async function doLoadAuth2()
    {
        let auth2 = await(loadAuth2(process.env.REACT_APP_CLIENT_ID, process.env.REACT_APP_CSCOPES));
        if(auth2.isSignedIn.get())
            updateUser(auth2.currentUser.get().getBasicProfile());
        else
            attachSignInEle(document.getElementById("gapi-signin-button"),auth2);

    }
    useEffect(_=>{
        doLoadAuth2();
    },[])


    function updateUser(basicProfile){
        let tmpusr = {
            name:basicProfile.getName(),
        }
        setUser(tmpusr)
        updateUserCallback(tmpusr)
    }

    function attachSignInEle(ele,auth2)
    {
        auth2.attachClickHandler(ele,{},
            (googleUser)=>{
                console.log(googleUser);
                updateUser(googleUser.getBasicProfile());
            },(error)=>{
                console.log(JSON.stringify(error));
            });
        setIsReady(true);
    }

    function signOut()
    {
        let auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(_=>{
            setUser(null);
            updateUserCallback(null);
        })
    }

    return(
        <>
            {user != null &&
                <Button type="primary" onClick={signOut}>Logout {user.name}</Button>
            }
            {user == null &&
                <Button id="gapi-signin-button" type="primary" disabled={!isReady}>Sign In</Button>
            }
        </>
    )
}

export default GoogleLogin;