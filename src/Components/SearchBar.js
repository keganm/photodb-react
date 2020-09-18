import React, { useState, useEffect } from 'react'

import {Layout,Input,Form,Row,Col,Button,Option, Select,Radio } from 'antd';
import {DownOutlined,UpOutlined,SearchOutlined,GlobalOutlined,ProjectOutlined,CopyrightOutlined,InfoCircleOutlined  } from '@ant-design/icons';
import { CheckMedia, MediaSizes } from '../Utils/MediaQuery';

const {Header} = Layout;
const {Search} = Input;

const kSearchTypes = {txt:1,drpdwn:2,rdio:3,tags:4};
const kTypeOptions = [
        {label:"Vertical",value:"Vertical"},
        {label:"Arch",value:"Arch"},
        {label:"Shooter",value:"Shooter"},
        {label:"WaterWall",value:"WaterWall"},
        {label:"WaterFall",value:"WaterFall"}];
    const kCreditOptions = [
        {label:"All",value:"All"},
        {label:"Fluidity Owned",value:"Fluidity"},
        {label:"Third Party",value:"Partial"},
        {label:"Internal Only",value:"Internal"}];
    const kRegionOptions = [
        {label:"US",value:"US"},
        {label:"North America",value:"NorthAmerica"},
        {label:"South America",value:"SouthAmerica"},
        {label:"Middle East",value:"MiddleEast"},
        {label:"Asia",value:"Asia"},
        {label:"West Europe",value:"WestEurope"},
        {label:"East Europe",value:"EastEurope"},
        {label:"Australia",value:"Australia"},
        {label:"Africa",value:"Africa"},
        {label:"India",value:"India"}];


export const SearchBar = () =>{
    const searchFields = [
        {label:"Name",type:kSearchTypes.txt},
        {label:"Project",type:kSearchTypes.txt},
        {label:"Type",type:kSearchTypes.drpdwn,content:kTypeOptions},
        {label:"Region",type:kSearchTypes.drpdwn,content:kRegionOptions},
        {label:"Credit",type:kSearchTypes.rdio,content:kCreditOptions},
    ];

    const [screenSize,setScreen] = useState({width: 0, height: 0});

    const [expanded,setExpanded] = useState(false);
    const [form] = Form.useForm();

    useEffect(()=>{
        window.addEventListener('resize',()=>{setScreen({ width: window.innerWidth, height: window.innerHeight })})
        setScreen({ width: window.innerWidth, height: window.innerHeight });
    },[])

    const fillFields = () =>{
        const children = [];
        for(let i = 0; i <searchFields.length; i++)

        {
            let fld = searchFields[i];
            let mq = CheckMedia(screenSize.width)
            let w = '45vw';
            if(mq >= MediaSizes.xlarge)
            w = '22vw'
            if(mq <= MediaSizes.medium || fld.type === kSearchTypes.rdio)
            w = '95vw'
        children.push(

            <Form.Item
                key={"key-"+fld.label}
                label={mq <= MediaSizes.medium?'':fld.label}
                style={{width:w}}
                rules={
                    [{
                        required:false,
                        message:'enter ' + fld.label,
                    }]
            }>
                {fld.type === kSearchTypes.drpdwn &&
                    <Select options={fld.content} allowClear/>
                }

                {fld.type === kSearchTypes.rdio &&
                    <Radio.Group options={fld.content} optionType="button" buttonStyle="solid"/>
                }

                {fld.type === kSearchTypes.txt &&
                    <Input
                        placeholder={"Search by " + fld.label}
                        prefix={fld.name}/>
                }
            </Form.Item>
        )
    }

        return children;
    }

    const onFinish = values => {
        console.log('Received values: ',values);
    }

    const onSearch = values =>{
        console.log('Searching for: ',values);
    }

    const getHeaderHeight=(isexpanded)=>{
        
        let mq = CheckMedia(screenSize.width)
        let h = '22vh';
        if(mq >= MediaSizes.xlarge)
        h = '16vh'
        if(mq <= MediaSizes.medium)
        h = '32vh'
        if(!isexpanded)
        h = screenSize.width<731?'8vh':'6vh'
        return({
            height:h,
            width:'100%',
            padding:'4px'
        })
    }

    return(
        
        <Header style={getHeaderHeight(expanded)} className="App-header">
        <Row style={{width:'100%',lineHeight:"2vh" , padding:'8px'}}>
            <Col span={4}>
                {screenSize.width < 320?<span>Fluidity</span>:<span>Fluidity Photo Database</span>}
            </Col>
            <Col span={18}>
            <Search
                placeholder = "input search text"
                onSearch = {onSearch}
                enterButton/>
            </Col>
            <Col span={1}>
                <Button className="floating-button-top-right" icon={expanded?<UpOutlined/>:<DownOutlined/>} onClick={()=>{setExpanded(!expanded)}}></Button>
            </Col>
        </Row>
        {expanded &&
        <Row style={{width:'100%',lineHeight:"2vh" , padding:'8px'}}><Col span={24}>
            <Form
                form={form}
                name = "search-bar"
                className = "header-search-bar"
                onFinish = {onFinish}
                layout="inline" >
                {fillFields()}
            </Form></Col></Row>
        }
        </Header>
    )
}