import React, { useState, useEffect } from 'react'

import {Layout,Input,Form,Row,Col,Button} from 'antd';
import {DownOutlined,UpOutlined,SearchOutlined} from '@ant-design/icons';

const {Header} = Layout;
const {Search} = Input;

export const SearchBar = () =>{
    const [expanded,setExpanded] = useState(false);
    const [form] = Form.useForm();

    const fillFields = () =>{
        const children = [];
        children.push(
            <Col span={24} style={{textAlign: 'right'}}>
            <Row>
                <Col span={20}>
                    <Form.Item
                      name={'searchtxt'}
                      label={'Search'}
                      rules={[
                          {
                              required:true,
                              message:'input search text'
                          }
                      ]}>
                          <Input placeholder='input search text'/>
                      </Form.Item>
                </Col>
                <Col span={4}>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>

                    </Button>
                </Col>
            </Row>
            </Col>
        )
    }

    const onFinish = values => {
        console.log('Received values: ',values);
    }

    const onSearch = values =>{
        console.log('Searching for: ',values);
    }
    const getHeaderHeight=(isexpanded)=>{
        return({
            height:isexpanded?'22vh':'10vh',
            width:'100%',
            padding:'4px'
        })
    }

    return(
        
        <Header style={getHeaderHeight(expanded)} className="App-header">
        <Row style={{width:'100%',lineHeight:"4vh" , padding:'8px'}}>
        <Col span={6}>
        Fluidity Photo Database</Col>
        <Col span={17}>
        <Search
            placeholder = "input search text"
            onSearch = {onSearch}
            enterButton/></Col>
        <Col span={1}>
            <Button style={{float:"right"}} icon={expanded?<UpOutlined/>:<DownOutlined/>} onClick={()=>{setExpanded(!expanded)}}></Button>
        </Col>
        </Row>
        {expanded &&
        <Form
            form={form}
            name = "search-bar"
            className = "header-search-bar"
            onFinish = {onFinish}>
            
            <Row gutter={24}>{fillFields()}</Row>
            </Form>
        }
        </Header>
    )
}