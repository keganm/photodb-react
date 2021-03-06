import React, { useState, useEffect } from "react";
import { gapi, loadAuth2 } from "gapi-script";
import { FolderStruct } from "../Utils/FolderStruct";
import { kMimeOptions } from "../Utils/FileProperties";

const defaultFieldList = [
  "id",
  "driveId",
  "name",
  "mimeType",
  "imageMediaMetadata",
  "videoMediaMetadata",
  "parents",
  "description",
  "properties",
  "appProperties",
  "contentHints",
  "hasThumbnail",
  "thumbnailLink",
  "thumbnailVersion",
  "webContentLink",
  "webViewLink",
  "capabilities",
];

const PHOTOFOLDERNAME = "FluidityPhotos";

export const MIMEQUERIES = (val,contains)=>{
  let tmp = contains?" ":" not ";
  tmp += "mimeType contains '" + val +"'";
  return 
}

  
const getCheckedList = (mlist) => {
  let tmp = [];
  for (let i = 0; i < kMimeOptions.length; i++)
    tmp.push({
      name: kMimeOptions[i].value,
      value: mlist.includes(kMimeOptions[i].value),
    });
  return tmp;
};

const qAnd=(str)=>{
  return str.length === 0? str: " and ";
}
const qOr=(str)=>{
  return str.length === 0? str: " or ";
}
const checkMime = (mime)=>{
  return kMimeOptions.includes(mime);
}

export const QUERIES = {
  FoldersOnly: function () {
    return "mimeType = 'application/vnd.google-apps.folder'";
  },
  NoFolders: function () {
    return "mimeType != 'application/vnd.google-apps.folder'";
  },
  ParentIs: function (parent) {
    return "'" + parent + "' in parents";
  },
  SearchQuery: function(searchprams){
    let tmp = "";
    if(searchprams.text)
      tmp += "fullText contains '"+ searchprams.text + "'"
    if(searchprams.name){
      tmp += qAnd(tmp);
      tmp += "name contains '" + searchprams.name + "'";
    };
    if(searchprams.project){
      tmp += qAnd(tmp);
      tmp += "properties has {key='project' and value='" + searchprams.project + "' and visibility='PRIVATE'}"
    }
    if(searchprams.type){
      tmp += qAnd(tmp);
      tmp += "properties has {key='type' and value='" + searchprams.type + "' and visibility='PRIVATE'}"
    }
    if(searchprams.region){
      tmp += qAnd(tmp);
      tmp += "properties has {key='region' and value='" + searchprams.region + "' and visibility='PRIVATE'}"
    }
    if(searchprams.credit){
      tmp += qAnd(tmp);
      tmp += "properties has {key='credit' and value='" + searchprams.credit + "' and visibility='PRIVATE'}"
    }
    if(searchprams.mime){
      let mimes = getCheckedList(searchprams.mime);
      tmp += "and (";
      for(let i = 0; i < mimes.length; i++){
        if(i > 0)
          tmp += mimes[i].value?" or ":" and ";
        tmp += mimes[i].value?"":"not ";
        tmp += "mimeType contains '" + mimes[i].name + "'";
      }
      tmp += " and not mimeType = 'application/vnd.google-apps.folder'"
      tmp += ")"

    }
      
    console.log("Search Query: " + tmp)
    return tmp;
  }
};

const LIST_TYPES = {
  FILES: 0,
  DRIVES: 1,
  FOLDERS: 2,
};

const GAPI_BASE_LIST = (photoId, parent) => {
  return {
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    pageSize: "100",
    driveId: photoId ? photoId.id : "",
    corpora: photoId ? "drive" : "allDrives",
  };
};

const GetFieldRequest = (type) => {
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
};

class GoogleDriveInterface {
  constructor(props) {
    this.props = props;
    this.photoFolder = null;
    this.parentList = null;
    this.myDriveInterface = this;
    this.InitCallback = null;
  }

  Init = (props, callback) => {
    this.InitCallback = callback;
    if (props) this.props = props;

    return (
      gapi.client.load(process.env.REACT_APP_DRIVE_DOC).then(() => {
        console.log("GAPI client loaded");
        this.GetDriveList(this.FindPhotoFolder, {});
      }),
      function (e) {
        console.error("Error loading gapi", e);
      }
    );
  };


  UpdateFileContents = (fileId,name,tags,prams,callback) =>{
    
    let xhr = new XMLHttpRequest();

    xhr.responseType = 'json';


    xhr.onreadystatechange = ()=>{
      if(xhr.readyState != XMLHttpRequest.DONE){
        return;
      }
      var status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        console.log("Update Succesful",xhr.response);
        if(callback)
          callback(xhr.response);
      } else {
        console.log("Error returned",xhr.response);
        setTimeout(() => {
          this.UpdateFileContents(fileId,name,tags,prams,callback);
        }, Math.random() * 4000 + 500);
      }
    }

    let auth = gapi.auth.getToken();

    xhr.open('PATCH','https://www.googleapis.com/drive/v3/files/' + fileId + '?supportsAllDrives=true');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization','Bearer '+ auth.access_token);


    let content = {};
    if(name){
      content["name"] = name;
    }
    if(tags){
      content["description"] = tags;
    }
    if(prams){
      content["properties"] = prams;
    }

    let out = JSON.stringify(content);
    console.log(out);


    xhr.send(JSON.stringify(content));
  }


  GetDriveList = (callback, options) => {
    this.GetGapiList(LIST_TYPES.DRIVES, [], callback, options);
  };
  GetFileList = (callback, options) => {
    this.GetGapiList(LIST_TYPES.FILES, [], callback, options);
  };
  GetFolderList = (callback, options) => {
    if (!options) options = {};
    if (!options.query) options.query = QUERIES.FoldersOnly();
    this.GetGapiList(LIST_TYPES.FOLDERS, [], callback, options);
  };

  GetGapiList = (trgttype, returnedArray, callback, options) => {
    if (!options) {
      options = {};
    }
    if (!gapi.client.drive) {
      return;
    }
    let prams = GAPI_BASE_LIST(this.photoFolder);

    if (options.query) prams.q = options.query;
    if (options.pageToken) prams.pageToken = options.pageToken;

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

    return req.list(prams).then(
      (response) => {
        let responselist = returnedArray.concat(
          response.result.kind === "drive#driveList"
            ? response.result.drives
            : response.result.files
        );
        if (response.result.nextPageToken) {
          this.GetGapiList(trgttype, responselist, callback, {
            pageToken: response.result.nextPageToken,
            query: options.query,
          });
        } else {
          callback(responselist);
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  FindPhotoFolder = (files) => {
    let found = files.find(({ name }) => name === PHOTOFOLDERNAME);
    if (found) {
      let photoFolder = new FolderStruct({
        id: found.id,
        name: PHOTOFOLDERNAME,
        parents: [],
      });
      this.photoFolder = photoFolder;
      this.FireCallback(this.props.photoFolderCallback, photoFolder);
      if (this.InitCallback) this.InitCallback();
    } else alert("Issue Finding Photo Folder, do you have access?");
  };

  FireCallback = (callback, opts) => {
    if (callback) callback(opts);
  };

  getAccessToken = () => {
    return gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
      .id_token;
  };


}

export const GoogleDrive = new GoogleDriveInterface();
