import React,{useState,useEffect,useRef} from 'react';
import {Layout,Button,BackTop,Row,Col} from 'antd';
const {Header,Footer,Sider,Content} = Layout;

export const SideBar = (props)=>{

    const [collapsed,setCollapse] = useState(true);

    const modifiedWidth = (collapsed)=>{
        if(collapsed)
        return {width:'400px'}
        else
        return {width:'50px'}
    }

    return(
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapse} style={modifiedWidth(collapsed)}>

        <div style={{width:"100%"}}>sider</div>

        </Sider>
    )
}