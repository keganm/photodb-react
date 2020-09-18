import React,{useState,useEffect,useRef} from 'react';
import {Layout,Button,BackTop,Row,Col} from 'antd';
import {BrowserRouter as Router,Switch,Route,Link, useLocation,withRouter} from "react-router-dom";

import './App.less';

import GoogleLogin from './Components/GoogleLogin';
import {GoogleDrive} from './Components/GoogleDrive';
import {GapiInterface} from './Components/GoogleInterface';

import {FolderBreadcrumb} from './Components/FolderBreadcrumb'
import { Folders } from './Components/Folders';
import {Images} from './Components/Images';
import {SearchBar} from './Components/SearchBar';
import {SideBar} from './Components/Sidebar'

import {MenuUnfoldOutlined,MenuFoldOutlined} from '@ant-design/icons';

const {Header,Footer,Sider,Content} = Layout;


function App(props) {
  return(
      <Contents args = {props}/>
    );
}

function useQuery(){
  return new URLSearchParams(useLocation().search);
}

function Contents(props){
  let query = useQuery();
  let trgtFolder = query.get("id");

  const layoutStyle ={
    minHeight:"100vh",
    minWidth:"100vw"
  }


  const [currentUser,SetCurrentUser] = useState(null);
  const [photoFolder,SetPhotoFolder] = useState(null);

  const [currentFolder,SetCurrentFolder] = useState(null);


  useEffect(()=>{
    console.log(photoFolder)
    SetCurrentFolder(photoFolder);
  },[photoFolder])

  useEffect(()=>{
    if(!currentUser){
      console.log("No user found Init");
      return;
    }
    GapiInterface.Init({
      photoFolder:photoFolder,
      photoFolderCallback:SetPhotoFolder,
    });
  },[currentUser])

  useEffect(()=>{
    console.log("Init");
  },[])

  useEffect(()=>{
    console.log(props);
  })

  return (
    
    <Layout style={layoutStyle}>
    <SearchBar/>
      <Layout>
      <Layout>


    <Content className="App">
      {currentUser && photoFolder && 
      
    <Switch>
      <Route path={["/","/folders"]}><>
            <FolderBreadcrumb   
              gapiInterface={GapiInterface} 
              photoFolder={photoFolder} 
              currentFolder={trgtFolder?trgtFolder:photoFolder.id}
              SetCurrentFolder={SetCurrentFolder}
            />
            <Folders      
              gapiInterface={GapiInterface} 
              photoFolder={photoFolder} 
              currentFolder={trgtFolder?trgtFolder:photoFolder.id}
              SetCurrentFolder={SetCurrentFolder}
            />
            <Images       
              gapiInterface={GapiInterface} 
              photoFolder={photoFolder} 
              currentFolder={trgtFolder?trgtFolder:photoFolder.id}
              SetCurrentFolder={SetCurrentFolder}/>
            </>
            </Route>
        <Route path="/s">
          <Content className="App">
            Searching
          </Content>
        </Route>
    </Switch>
      
      }
      {!currentUser &&
        <GoogleLogin setnewuser={SetCurrentUser}/>
      }
      <BackTop />
    </Content>

    <Footer>Footer</Footer>
    </Layout>
    <SideBar/>
      </Layout>
    </Layout>
    
  );
  
}

export default withRouter(App);
