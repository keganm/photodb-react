import React, { useState, useEffect } from "react";
import { gapi, loadAuth2 } from "gapi-script";
import { Button, Dropdown, Menu, Tooltip } from "antd";

function GoogleLogin(props) {
  const updateUserCallback = props.setnewuser;

  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isChangeReady, setIsChangeReady] = useState(false);

  async function doLoadAuth2() {
    let auth2 = await loadAuth2(
      process.env.REACT_APP_CLIENT_ID,
      process.env.REACT_APP_CSCOPES
    );
    if (auth2.isSignedIn.get()){
      updateUser(auth2.currentUser.get().getBasicProfile());
    }
    else {
      attachSignInEle(document.getElementById("gapi-signin-button"), auth2);
    }
  }
  useEffect((_) => {
    doLoadAuth2();
  }, []);

  function updateUser(basicProfile) {
    let tmpusr = {
      name: basicProfile.getName().split(" ")[0],
      img: basicProfile.getImageUrl(),
    };
    if(tmpusr){
      let auth2 = gapi.auth2.getAuthInstance();
      attachChangeUserEle(document.getElementById("gapi-change-button"), auth2);
    }
    setUser(tmpusr);
    updateUserCallback(tmpusr);
  }

  function attachSignInEle(ele, auth2) {
    if(!ele){
      setTimeout(()=>attachSignInEle(document.getElementById("gapi-signin-button"), auth2),100);
      return;
      
    }
    auth2.attachClickHandler(
      ele,
      {},
      (googleUser) => {
        console.log(googleUser);
        updateUser(googleUser.getBasicProfile());
      },
      (error) => {
        console.log(JSON.stringify(error));
      }
    );
    setIsReady(true);
  }

  function attachChangeUserEle(ele,auth2){
    
    if(!ele){
      setTimeout(()=>attachChangeUserEle(document.getElementById("gapi-change-button"), auth2),100);
      return;
    }
    auth2.attachClickHandler(
      ele,
      {prompt:'select_account'},
      (googleUser) => {
        console.log(googleUser);
        updateUser(googleUser.getBasicProfile());
      },
      (error) => {
        console.log(JSON.stringify(error));
      }
    );
    setIsChangeReady(true);
  }

  function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then((_) => {
      setUser(null);
      setIsReady(false);
      updateUserCallback(null);
      attachSignInEle(document.getElementById("gapi-signin-button"), auth2);
    });
  }



  return (
    <>
    <Dropdown overlay={
      <Menu>
        <Menu.Item id="gapi-signin-button" style={{textAlign:"right"}} key="0" disabled={user != null}>
            Login
        </Menu.Item>
        <Menu.Item style={{textAlign:"right"}} key="1"  onClick={()=>{signOut()}} disabled={user == null}>
            Logout {user?user.name:""}
        </Menu.Item>
        <Menu.Item id="gapi-change-button" style={{textAlign:"right"}} key="2" disabled={user == null}>
          Change User
        </Menu.Item>
      </Menu>
    } trigger={['click']}>
    <Tooltip placement="left" title={user?user.name:"Login"}>
      <Button shape="circle" style={{padding:"0px"}}>
      {user != null && (
        <img className="gapi-profile-image" src={user.img}/>
      )}
      {user == null && (
        <img style={{opacity:"0.35"}} className="gapi-profile-image" src="./images/sharp_account_box_black_36dp.png"/>
      )}
      </Button>
      </Tooltip>
    </Dropdown>
    </>
  );
}

export default GoogleLogin;
