import React, {useState, useEffect, useRef} from "react";
import {Layout, Button, BackTop, Row, Col, Alert} from "antd";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation,
    withRouter
} from "react-router-dom";

import "./App.less";

import GoogleLogin from "./Components/GoogleLogin";
import {GoogleDrive} from "./Components/GoogleDrive";
import {GapiInterface} from "./Components/GoogleInterface";

import {FolderBreadcrumb} from "./Components/FolderBreadcrumb";
import {Folders} from "./Components/Folders";
import {Images} from "./Components/Images";
import {SearchBar, StringToMime} from "./Components/SearchBar";

import {MenuUnfoldOutlined, MenuFoldOutlined} from "@ant-design/icons";

const {Header, Footer, Sider, Content} = Layout;

function App(props) {
    return <Contents args={props}/>;
}

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Contents(props) {
    let query = useQuery();
    let trgtFolder = query.get("id");

    const [searchPrams,
        SetSearchPrams] = useState({
        text: query.get("s"),
        name: query.get("n"),
        project: query.get("p"),
        type: query.get("t"),
        region: query.get("r"),
        credit: query.get("c"),
        mime: StringToMime(query.get("m"))
    });

    const layoutStyle = {
        minHeight: "100vh",
        minWidth: "100vw"
    };

    const [currentUser,
        SetCurrentUser] = useState(null);
    const [photoFolder,
        SetPhotoFolder] = useState(null);

    const [currentFolder,
        SetCurrentFolder] = useState(null);

    useEffect(() => {
        console.log(photoFolder);
        SetCurrentFolder(photoFolder);
    }, [photoFolder]);

    useEffect(() => {
        if (!currentUser) {
            console.log("No user found Init");
            return;
        }
        GapiInterface.Init({photoFolder: photoFolder, photoFolderCallback: SetPhotoFolder});
    }, [currentUser]);

    const getQuery = (path,variable)=>{
        if(!path)
        return null;
      let indx = path.indexOf(variable+"=");
      if(indx < 0)
        return null;

      let tmp = path.substring(indx+2);

      let ret = "";
      if(tmp.length == 0)
        return ret;
      let crnt = 0;
      let end = false;

      while(!end){
        ret += tmp[crnt];
        crnt++;
        end = tmp[crnt] === '&' || crnt >= tmp.length;
      }
      return ret;

    }

    useEffect(() => {
        console.log("Init");

        window.onpopstate = e => {
            let trgtFolder = query.get("id");
            console.log("Pop State Triggered")
            console.log(window.location.href)
            let p = window.location.href.split('?')[1];
            SetSearchPrams({
                text: getQuery(p,"s"),
                name: getQuery(p,"n"),
                project: getQuery(p,"p"),
                type: getQuery(p,"t"),
                region: getQuery(p,"r"),
                credit: getQuery(p,"c"),
                mime: StringToMime(getQuery(p,"m"))
            })
        }
        setVisible(true);
    }, []);

    useEffect(() => {
        if (window.location.pathname.includes("/folders/")) 
            ClearSearch();
        }
    );

    const ClearSearch = () => {
        if (Object.keys(searchPrams).length > 0) {
            console.log("Clear the search")
            SetSearchPrams({})
        }
    }

    const GetBodyHeight = () =>{
        return {overflowY:"auto", height:window.innerHeight - headerHeight + "px" };
    }
    const [headerHeight,SetHeaderHeight] = useState(68);
    const [isVisible,
        setVisible] = useState(true);
    return (
        <Layout style={layoutStyle}>
            <SearchBar SetHeaderHeight={SetHeaderHeight} SetSearchPrams={SetSearchPrams} LoadedPrams={searchPrams} SetCurrentUser={SetCurrentUser} style={{ position: 'fixed', zIndex: 1, width: '100%' }}/>
            <Layout>
                <Layout>
                <div style={GetBodyHeight()}>
                    <Content className="App">
                        {currentUser && photoFolder && (
                            <Switch>
                                <Route path="/search">
                                        <FolderBreadcrumb
                                        gapiInterface={GapiInterface}
                                        photoFolder={photoFolder}
                                        currentFolder={trgtFolder
                                        ? trgtFolder
                                        : photoFolder.id}
                                        SetCurrentFolder={SetCurrentFolder}
                                            isSearch={true}
                                        />
                                    <Images
                                        gapiInterface={GapiInterface}
                                        photoFolder={photoFolder}
                                        currentFolder={trgtFolder
                                        ? trgtFolder
                                        : photoFolder.id}
                                        SetCurrentFolder={SetCurrentFolder}
                                        SetSearchPrams={SetSearchPrams}
                                        isSearchInterface={true}
                                        searchPrams={searchPrams}/>
                                </Route>
                                <Route path={["/", "/folders"]}>
                                    <>
                                        <FolderBreadcrumb
                                        gapiInterface={GapiInterface}
                                        photoFolder={photoFolder}
                                        currentFolder={trgtFolder
                                        ? trgtFolder
                                        : photoFolder.id}
                                        SetCurrentFolder={SetCurrentFolder}/>
                                    <Folders
                                        gapiInterface={GapiInterface}
                                        photoFolder={photoFolder}
                                        currentFolder={trgtFolder
                                        ? trgtFolder
                                        : photoFolder.id}
                                        SetCurrentFolder={SetCurrentFolder}/>
                                    <Images
                                        gapiInterface={GapiInterface}
                                        photoFolder={photoFolder}
                                        currentFolder={trgtFolder
                                        ? trgtFolder
                                        : photoFolder.id}
                                        SetSearchPrams={SetSearchPrams}
                                        SetCurrentFolder={SetCurrentFolder}
                                        isSearchInterface={false}/>
                                </>
                            </Route>
                        </Switch>
                        )}
                        {!currentUser &&(
                            <Alert message="Please log in using the icon in the top right." type="error"/>
                        )}
                        <BackTop/>
                    </Content>
                    <Footer>Footer</Footer>
                    </div>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default withRouter(App);
