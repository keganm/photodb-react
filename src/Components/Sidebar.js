import React,{useState,useEffect,useRef} from 'react';
import {Layout,Drawer,Affix,Button,BackTop,Row,Col} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons'

const {Header,Footer,Sider,Content} = Layout;


export const SideBar = (props)=>{
    const sidebarstyle = ()=>
    {
        return {right:'10px', width:'46px',zIndex:'2'};
    }

    const [isVisible,setVisible] = useState(true);

    const toggleDrawer = () =>{
        setVisible(!isVisible)
    }
    const showDrawer = () =>{
        setVisible(true);
    }
    const hideDrawer = () =>{
        setVisible(false);
    }

    return(
        <>

        <div className="floating-button-bot-right">
            <Button
                onClick={()=>{toggleDrawer()}}
            >
                <InfoCircleOutlined />
            </Button>
        </div>
        
        <Drawer
            title="Basic Drawer"
            placement="right"
            closable = {true}
            onClose = {hideDrawer}
            visible = {isVisible}
            getContainer={false}
            width={450}
        >
            <p>Content</p>
        </Drawer>
</>
    )
}