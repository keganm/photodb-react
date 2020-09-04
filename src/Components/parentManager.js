import {FolderStruct} from '../Utils/FolderStruct'
import {GoogleDrive} from './GoogleDrive'
class ParentManager{
    constructor(props){
        this.folderStructure = [];
        this.props = props;
        this.callbacks = [];
        this.isStructured = false;
    }


    Init=(gdrive,props)=>{
        this.props = props;
        this.callbacks = [];
        this.isStructured = false;
        GoogleDrive.GetFolderList(this.GetFolders)
    }



    /*On Receiving response from get folder list
        dumps all the return to folderstructure
        then modifies the parent lists*/
    //resp = Array - file list returned from gapi
    GetFolders=(resp)=>{
        console.log(resp);
        //Set the photofolder as the root
        this.folderStructure = [GoogleDrive.photoFolder];
        //Add the returned list to the folder structure
        Array.prototype.push.apply(this.folderStructure,this.ToFolderStructList(resp))
        this.ParseList().then(()=>{
            //Remove the initial parent out of folders
            for(let i = 0; i < this.folderStructure.length; i++){
                this.folderStructure[i].parents.shift();
            }
            this.isStructured = true;
            this.ExecuteGetParentsCalbacks();
        })
    }
    /*Initiate the iteration through the folder list as a promise*/
    ParseList=()=> {
        return new Promise((resolve,reject)=>{
            let plist = [];
            this.stepThroughFolders(GoogleDrive.photoFolder.id,plist);
            resolve('finished');
        });
    }
    


    /*      Backend    */
    /*Iterate through folders based on parent id of folders*/
    stepThroughFolders=(parent,parentlist)=>{
        let list = [];

        for(let i=0; i<this.folderStructure.length; i++){
            if(this.folderStructure[i].parents[0] === parent)
                list.push(i);
        }

        let parentPointer = this.folderStructure[0];
        if(parent === GoogleDrive.photoFolder.id){
            parentPointer = GoogleDrive.photoFolder;
        }else{
            parentPointer = this.FindById(parent);
        }

        for(let i = 0; i < list.length; i++)
        {
            let newList = [];

            Array.prototype.push.apply(newList,parentlist);

            if(list.length > 0 && !newList.includes(parent))
                newList.push(parentPointer);

            Array.prototype.push.apply(this.folderStructure[list[i]].parents, newList);
            this.stepThroughFolders(this.folderStructure[list[i]].id,newList);
        }

    }



    /*      UTILS    */
    /*Convert to folder structure*/
    ToFolderStructList=(list)=>{
        let tmp = [];
        for(let i = 0; i < list.length; i++)
        {
            tmp.push(new FolderStruct({
                name : list[i].name,
                id : list[i].id,
                parents : list[i].parents
            }))
        }
        return tmp;
    }

    /*Return list of parent names*/
    GetParentNames(id){
        let p = this.GetParents(id);
        let tmp = [];
        for(let i = 0; i < p.length; i++)
        {
            tmp.push(this.FindById(p[i]).name);
        }
        return tmp;
    }

    /*Return folder by Id*/
    FindById(id){
        for(let i = 0; i < this.folderStructure.length; i++)
        {
            if(this.folderStructure[i].id === id)
                return this.folderStructure[i];
        }
    }

    /*Return folder by Name*/
    FindByName(name){
        for(let i = 0; i < this.folderStructure.length; i++)
        {
            if(this.folderStructure[i].name === name)
                return this.folderStructure[i];
        }
    }

    AddGetParentsCalback(id,callback){
        if(this.isStructured)
            callback(this.GetParents(id))
        if(callback && id)
            this.callbacks.push({callback:callback,id:id});

    }

    ExecuteGetParentsCalbacks(){
        for(let i = 0; i < this.callbacks.length; i++)
            this.callbacks[i].callback(this.GetParents(this.callbacks[i].id));
        this.callbacks = [];
    }

    /*Returns the parent list of id*/
    GetParents(id) {
        let selected = this.FindById(id);
        if(selected)
            return selected.parents;
        else
            return null;
    }

    sec(seconds){
        return seconds * 1000;
    }


}


export const GoogleParents = new ParentManager();