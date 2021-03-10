import React, { useState, useEffect, useRef } from "react";
import {Modal} from "antd";
import { FolderTreeView } from "./FolderTreeView";


export const MoveToModal = (props) =>{
    const [isModalVisible,setIsModalVisible] = useState(true);

    useEffect(()=>{

    },[])

    const ShowModal = () =>{
        setIsModalVisible(true);
    }

    const onOK = ()=>{

        setIsModalVisible(false);
    }

    const onCancel = () =>{

        setIsModalVisible(false);
    }


    return(
        <Modal title="MoveTo" visible={isModalVisible} onOk={onOK} onCancel={onCancel}>
            <FolderTreeView
                gapiInterface ={props.gapiInterface}
            />
        </Modal>
    )
}

