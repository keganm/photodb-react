import React, { useState } from 'react'
import { Input, Tag, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';



export const EditableTagGroup = (props)=>{

    const [inputVisible,SetInputVisible] = useState(false);
    const [inputValue,SetInputValue] = useState('');
    const [editInputIndex,SetEditInputIndex] = useState(-1);
    const [editInputValue,SetEditInputValue] = useState('');


    const handleClose = removedTag =>{
        props.SetTags(props.tags.filter(tag=>tag!==removedTag));
    }


    const handleInputConfirm = ()=>{
        let tags = props.tags;
        if(inputValue && tags.indexOf(inputValue) === -1)
            tags = [...tags,inputValue];
        props.SetTags(tags);
        SetInputValue('');
        SetInputVisible(false);
    }

    const handleEditInputConfirm = ()=>{
        const newTags = [...props.tags];
        newTags[editInputIndex] = editInputValue;

        props.SetTags(newTags);
        SetEditInputIndex(-1);
        SetEditInputValue('');
    }
    
    return(
        <>
        {props.tags &&
        <>
            {props.tags.map((tag,index)=>{
                if(editInputIndex === index){
                    return(
                        <Input
                            ref={(_input)=>{if(_input)_input.focus()}}
                            key={tag}
                            size="small"
                            className="tag-input"
                            value={editInputValue}
                            style={{width:"25%"}}
                            onChange={e=>SetEditInputValue(e.target.value)}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    );
                }

                const isLongTag=tag.length > 20;

                const tagElem=(
                    <Tag
                    className="edit-tag"
                    key={tag}
                    closable={true}
                    onClose={()=>{handleClose(tag)}}
                    >
                        <span 
                            style={{color:"#08c"}}
                            onDoubleClick={e=>{
                                if(index !== 0){
                                    SetEditInputIndex(index);
                                    SetEditInputValue(tag);
                                    e.preventDefault();
                                };
                            }}
                        >
                            {isLongTag ? `${tag.slice(0,20)}...`:tag}
                        </span>
                    </Tag>
                );

                return isLongTag?
                    (
                    <Tooltip title={tag} key={tag}>
                        {tagElem}
                    </Tooltip>
                    ):
                    (
                    <Tooltip title={"Double click to edit"} key={tag}>
                        {tagElem}
                    </Tooltip>
                    )
            })}

            {inputVisible && (
                <Input
                    ref={(_input)=>{if(_input)_input.focus()}}
                    type="text"
                    size="small"
                    className="tag-input"
                    value={inputValue}
                    style={{width:"25%"}}
                    onChange={e=>SetInputValue(e.target.value)}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!inputVisible &&(
                <Tag className="site-tag-plus" onClick={()=>{SetInputVisible(true);}}>
                    <PlusOutlined style={{fontSize:"smaller"}}/><span style={{color:"#0c9"}}>New Tag</span>
                </Tag>
            
            )}
        </>
        }
        </>
    )
}
