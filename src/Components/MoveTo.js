
import React,{useState,useEffect,useRef}from "react";
import {Modal, Tree,Switch } from "antd";
import { GoogleParents } from "./parentManager";

export const MoveToModal = (props)=>{

    const [selected,setSelected] = useState(null);


    const onSelect = (selectedKeys,info)=>{
        setSelected(selectedKeys[0]);
    }


    return(
        <>

                <Modal
                    title="Move To..."
                    visible={props.moveToVisible}
                    onOk = {()=>{props.onMoveToConfirm(selected)}}
                    onCancel = {props.onMoveToCancel}
                >

                <Tree
                showLine = {false}
                showIcon = {false}
                defaultExpandedKeys = {(GoogleParents && GoogleParents.isStructured)?[GoogleParents.childrenStructure[0].key]:[]}
                onSelect = {onSelect}
                treeData = {(GoogleParents && GoogleParents.isStructured)?GoogleParents.childrenStructure:[]}
                />

                </Modal>

        </>
    )
}