import React, { useState, useEffect, useRef } from "react";
import { Tree, Switch } from 'antd';

import { GoogleParents } from "./parentManager";


export const FolderTreeView = (props) =>{

    const [childrenView,SetChildrenView] = useState([]);
    useEffect(()=>{
        if(!props.gapiInterface.isInit)
        return;
        console.log("Add callback folder tree view")
        GoogleParents.AddChildrenCallback(
            "folder-treeview",
            (e)=>{SetChildrenView(e)}
        )
    },[props.gapiInterface.isInit])

    const OnSelected = (e) =>{

    }

    const getTreeData = ()=>{

        let data = [];
        return(data);
    }


    return(
        <div>
            <Tree
                showLine={true}
                showIcon={false}
                onSelect={OnSelected}
                treeData={childrenView}
                />
            <span>this is the tree view</span>
        </div>
    );
};

