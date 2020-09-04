import React,{useState,useEffect} from 'react'
import {gapi,loadAuth2} from 'gapi-script';
import {FolderStruct} from '../Utils/FolderStruct'


const defaultFieldList = [
    'id',
    'driveId',
    'name',
    'mimeType',
    'imageMediaMetadata',
    'videoMediaMetadata',
    'parents',
    'description',
    'properties',
    'contentHints',
    'hasThumbnail',
    'thumbnailLink',
    'thumbnailVersion',
    'webContentLink',
    'webViewLink',
    'capabilities'
]

const PHOTOFOLDERNAME = 'FluidityPhotos';

export const QUERIES={
    FoldersOnly:function (){return "mimeType = 'application/vnd.google-apps.folder'"},
    NoFolders: function(){return "mimeType != 'application/vnd.google-apps.folder'"},
    ParentIs:function(parent){return "'"+parent+"' in parents"},
}

const LIST_TYPES={
    FILES:0,
    DRIVES:1,
    FOLDERS:2
}

const GAPI_BASE_LIST = (photoId,parent)=> {
    return{
        "includeItemsFromAllDrives": true,
        "supportsAllDrives": true,
        "pageSize":"100",
        "driveId":photoId?photoId.id:"",
        "corpora":photoId?"drive":"allDrives",
    }
  };


const GetFieldRequest = (type)=>{
    switch (type) {
        case LIST_TYPES.DRIVES:
			return "nextPageToken";
    
        case LIST_TYPES.FILES:
			return "nextPageToken, files(" + defaultFieldList + ")";

        case LIST_TYPES.FOLDERS:
			return "nextPageToken, files(id,name,parents,mimeType)";

        default:
			return "nextPageToken, files(" + defaultFieldList + ")";
    }
}

class GoogleDriveInterface{
    constructor(props){
        this.props = props;
        this.photoFolder = null;
        this.parentList = null;
        this.myDriveInterface = this;
        this.InitCallback = null;
    }

    Init=(props,callback)=>
    {
        this.InitCallback = callback;
        if(props)
            this.props = props;

        return(gapi.client.load(
            process.env.REACT_APP_DRIVE_DOC)
        .then(()=>{
                    console.log("GAPI client loaded");
                    this.GetDriveList(this.FindPhotoFolder,{});

                }),
                function(e){
                    console.error("Error loading gapi",e)});
    }

    GetDriveList=(callback,options)=>
    {
        this.GetGapiList(LIST_TYPES.DRIVES,[],callback,options);
    }
    GetFileList=(callback,options)=>
    {
        this.GetGapiList(LIST_TYPES.FILES,[],callback,options);
    }
    GetFolderList=(callback,options)=>
    {
        if(!options)
        options = {}
        if(!options.query)
        options.query = QUERIES.FoldersOnly();
        this.GetGapiList(LIST_TYPES.FOLDERS,[],callback,options);
    }

    GetGapiList=(trgttype,returnedArray,callback,options)=>{
        if(!options){options={}};
        if(!gapi.client.drive)
        {
            return;
        }
        let prams = GAPI_BASE_LIST(this.photoFolder);
        
        if(options.query)
            prams.q = options.query;
        if(options.pageToken)
            prams.pageToken  = options.pageToken;

        prams.fields = GetFieldRequest(trgttype);

        let req;
        switch (trgttype) {
            case LIST_TYPES.DRIVES:
                req = gapi.client.drive.drives;
                prams = {};
                break;
        
            case LIST_TYPES.FILES:
                req = gapi.client.drive.files;
                break;

            case LIST_TYPES.FOLDERS:
                req = gapi.client.drive.files;
                break;

            default:
                req = gapi.client.drive.files;
                break;
        }



        return req.list(prams)
            .then((response)=>{
                let responselist = returnedArray.concat(response.result.kind === "drive#driveList"?response.result.drives:response.result.files);
                if(response.result.nextPageToken){
                    this.GetGapiList(
                        trgttype,
                        responselist,
                        callback,
                        {pageToken:response.result.nextPageToken,
                        query:options.query});
                }else{
                    callback(responselist);
                }
            },
            function(err){
                console.log(err)
            })
    }

    FindPhotoFolder = (files)=>{
        let found = files.find(({name})=> name === PHOTOFOLDERNAME);
        if(found){
            let photoFolder = new FolderStruct({
                id:found.id,
                name:PHOTOFOLDERNAME,
                parents:[]
            })
            this.photoFolder = photoFolder;
            this.FireCallback(this.props.photoFolderCallback,photoFolder);
            if(this.InitCallback)
                this.InitCallback();
        }
        else
            alert("Issue Finding Photo Folder, do you have access?");
    }

    FireCallback=(callback,opts)=>{
        if(callback)
            callback(opts);
    }

    
    getAccessToken=()=>
    {
        return gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    }

}


export const GoogleDrive = new GoogleDriveInterface();

