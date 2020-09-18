import React, { useState, useEffect,useRef } from 'react'
import {Card, Button, Row,Col} from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { Image } from 'antd';

import {MediaSizes, CheckMedia} from '../Utils/MediaQuery';

import {GoogleDrive,QUERIES} from './GoogleDrive';
import {GoogleParents} from './parentManager';

const {Meta} = Card;
const ImageCard = (args,props)=>{
    const cardEle = useRef(null)

    const [isHovering,SetIsHovering] = useState(false);
    const [originalHeight,SetOriginalHeight] = useState(null);
    const [marginOffset,SetMarginOffset] = useState(null)
    
    let style = {
        textAlign:'center',
        padding:'4px',
        width : '100%'
    };
    
    function rowStyle(){return{position: "sticky",
    zIndex: 2,
    marginBottom:marginOffset?marginOffset+"px":"-16vh"
}}


    /*Preview type presentation*/
    function loadInImage(){
        if(cardEle)
            SetOriginalHeight(cardEle.current.clientHeight)
        SetIsHovering(true);
    }
    useEffect(()=>{
        if(cardEle && originalHeight)
            SetMarginOffset(originalHeight - cardEle.current.clientHeight);
    },[originalHeight])

    function CardClicked(e){
        console.log("Card Clicked");
    }
    
    return(
        <Row style={isHovering&&rowStyle()} 
            key={props.id}>
            {props.thumbnailLink && 
            <Col ref={cardEle} span={24}>
                <Card
                        hoverable={true}
                        className={"image-card"}
                        style={style}
                        cover={<img
                            alt={props.name}
                            onMouseUp={(e)=>{CardClicked(e)}}
                            onDoubleClick={(e)=>{console.log("Double clicked")}}
                            src={props.thumbnailLink}/>}
                        onMouseEnter={()=>{loadInImage()}}
                        onMouseLeave={()=>{SetIsHovering(false)}}
                        actions={isHovering&&[
                            <SettingOutlined key="setting" onClick={()=>{console.log("Settings Clicked")}}/>,
                            <EditOutlined key="edit" />,
                            <EllipsisOutlined key="ellipsis" />,
                            ]}
                        >
                        {
                            /*<Image alt={props.name} 
                                    width={220}
                                src={"https://drive.google.com/u/0/uc?"+"id="+props.id+"&export=download"} 
                                placeholder={
                                <Image
                                    src={props.thumbnailLink}
                                    width={220}
                                />}
                                />*/
                        }
                        {isHovering && 
                            <Meta className={"image-meta"} 
                                    title={props.name} 
                                    description={props.imageMediaMetadata?props.imageMediaMetadata.width+"x"+props.imageMediaMetadata.height:""}/>
                        }
                </Card>
            </Col>
        }
        {/*!props.thumbnailLink &&
            
            <Col span={24}><Card 
                        style={style} 
                        >
                    <Meta title={props.name}/>
                </Card>
                </Col>
        */}
            </Row>
    )
}

export const Images = (props) =>{
    const [screenWidth,SetScreenWidth] = useState(window.innerWidth);
    const [files,setFiles] = useState(null);

    useEffect(()=>{
        window.addEventListener('resize',()=>{
            SetScreenWidth(window.innerWidth);
        })
    },[]);

    function IsReady(){
        return props.currentFolder && props.photoFolder && props.gapiInterface;
    }

    function OnFileListReturned(list)
    {
        console.log(list);
        setFiles(list);
    }

    function GetFiles(){
        if(!IsReady())
            return;
        console.log("Get Files");
        GoogleDrive.GetFileList(OnFileListReturned,{query:QUERIES.NoFolders() + " and " + QUERIES.ParentIs(props.currentFolder)})
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
        GetFiles();
    },[props.photoFolder, props.currentFolder, props.gapiInterface])

    useEffect(()=>{
        if(!props.fileList)
            return;
        console.log(props.fileList);
    },[props.fileList])



    function ShowFiles(){
        return files==null?false:files.length>0;
    }
    function GetEveryX(x,offset){
        let tmp = [];
        for(var i = offset; i < files.length; i+=x)
            tmp.push(files[i]);
        return tmp;
    }

    function SortToCol(count){

        if(count === 1){
            return [files];
        }

        let cols = []
        
        if(files.length <= count){
            for(let i = 0; i < count; i++)
                cols.push(files[i]?[files[i]]:null);
            return cols;
        }
        
        for(let i = 0; i < count; i++)
            cols.push([])

            

        let trgtmax = 1;
        let coltrgt = 0;
        let accum = 0;
        let maxaccum = trgtmax;
        let accumthresh = 0.1;



        /*MAYBE or return to commented version below*/
        /*
        let totalRatio = 0;
        let avgRatio = .66;
        for(let i = 0; i < files.length; i++){
            let meta = files[i].imageMediaMetadata;
            let r = meta?(meta.height === 0 || meta.width === 0)?0.66:(meta.height/meta.width):0.66;
            totalRatio += r;
            avgRatio += r;
            avgRatio *= 0.5;
        }

        avgRatio*=0.5;
        for(let i = 0; i < files.length; i++)
        {
            let meta = files[i].imageMediaMetadata;
            let ratio = meta?meta.height/meta.width:1;
            if(!meta || meta.height === 0 || meta.width === 0)
                ratio = 1;

            cols[coltrgt].push(files[i]);
            accum += ratio;

            if(accum >= totalRatio/count-avgRatio && coltrgt < cols.lengt-1){
                console.log(totalRatio/count + " : " + accum);
                accum = 0;
                coltrgt++;
            }
        }
*/

        for(let i = 0; i < files.length; i++)
        {
            let meta = files[i].imageMediaMetadata;
            let ratio = meta?meta.height/meta.width:1;
            if(!meta || meta.height === 0 || meta.width === 0)
                ratio = 1;

            cols[coltrgt].push(files[i]);
            accum += ratio;

            if(accum >= maxaccum-accumthresh){
                maxaccum = (trgtmax+accum)/2;
                coltrgt++;
                accum = 0;
                if(coltrgt >= count){
                    console.log("linebreak: " + maxaccum)
                    coltrgt = 0;
                    //maxaccum = (trgtmax+maxaccum)/2;
                }
            }
        }
        return cols;
    }

    function GetCol(col){
        if(col)
        return(col.map((item)=>ImageCard({screenWidth:screenWidth,SetCurrentFolder:props.SetCurrentFolder},item)));
        return(col);
        
    }
    function RatioBasedColumms(){

        let count = CheckMedia(screenWidth);

        let tmparray = [];
        for(var i = 0; i < count; i++)
            tmparray.push(i);


        let cols = SortToCol(count);

        console.log(cols);


        if(!cols[cols.length-1])
            count--;
        else if(cols[cols.length-1] && cols[cols.length-1].length <= 0)
            count--;
        
        let span = Math.floor(24/count);
        return (
            cols.map((col,index)=>{
                if(col && col.length > 0)
                    return (<Col key={index} span={span}>{GetCol(col)}</Col>)
                return (<Col key={index} span={span}><></></Col>)
                })
        )
    }

    return(
        <>{ShowFiles() &&
        <Card title="Images" style={{paddingBottom: "18vh"}}>
                <Row>
                    <RatioBasedColumms/>
                </Row>
        </Card>
        }
        </>
    )
}