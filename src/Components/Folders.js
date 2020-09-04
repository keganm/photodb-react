import React, { useState, useEffect } from 'react'

import {Card, Button} from 'antd';

import {QUERIES} from './GoogleDrive';
import { CheckMedia, MediaSizes } from '../Utils/MediaQuery';

import {Link} from "react-router-dom";

import {GoogleDrive} from './GoogleDrive';
import {GoogleParents} from './parentManager';
export const Folder = (args,props) =>{

    const fullButton = {
        height:'100%',
        padding:'24px'
    }

    function styleWDynaWidth(){
        let tmp = {
            textAlign:'center',
            padding:'0'
        };

        let msize = CheckMedia(args.screenWidth);
        switch(msize){
            case MediaSizes.small:
                tmp.width = '100%';
                break;
            case MediaSizes.medium:
                tmp.width = '50%';
                break;
            case MediaSizes.large:
                tmp.width = '33%';
                break;
            case MediaSizes.xlarge:
                tmp.width = '25%';
                break;
            case MediaSizes.xxlarge:
                tmp.width = '20%';
                break;
            default:
                tmp.width = '33%';
                break;
        }
        return tmp;
    }

    return(
        <Card.Grid key={props.id} style={styleWDynaWidth()}>
        <Link to={"/folders/?id="+props.id}>
    <Button 
    style={fullButton} 
    block>
        {props.name}
    </Button>
    </Link>
        </Card.Grid>
        
        
    )
}

export const Folders = (props) => {

    
    const[screenWidth,SetScreenWidth] = useState(window.innerWidth);
    const [folders,setFolders] = useState(null);

    
    useEffect(()=>{
        window.addEventListener('resize',()=>{
            SetScreenWidth(window.innerWidth)
        })
    },[])

    function IsReady(){
        return props.currentFolder && props.photoFolder && props.gapiInterface;
    }

    function OnFolderListReturned(list)
    {
        console.log(list);
        setFolders(list);
    }

    function GetFolders(){
        if(!IsReady())
            return;

        GoogleDrive.GetFolderList(OnFolderListReturned,{query:QUERIES.FoldersOnly() + " and " + QUERIES.ParentIs(props.currentFolder)})
    }

    useEffect(()=>{
        if(!props.gapiInterface)
            return;
        console.log(props.gapiInterface);

    },[props.gapiInterface])
    
    useEffect(()=>{
        if(!props.photoFolder)
            return;
        console.log(props.photoFolder);
        GetFolders();
    },[props.photoFolder, props.currentFolder, props.gapiInterface])

    useEffect(()=>{
        if(!props.folderList)
            return;
        console.log(props.folderList);
    },[props.folderList])


    function ShowFolders(){
        return folders==null?false:folders.length>0;
    }

    const FolderGridArray = folders!=null?folders.map((item)=>Folder({screenWidth:screenWidth,SetCurrentFolder:props.SetCurrentFolder},item)):null;
    return(
        <>{ShowFolders() &&
        <Card title="Folders">
            {FolderGridArray}
        </Card>}
        </>
    )
}
