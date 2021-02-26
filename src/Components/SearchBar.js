import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Layout,
  Input,
  Form,
  Row,
  Col,
  Button,
  Option,
  Select,
  Radio,
  Checkbox,
  message,
} from "antd";
import {
  DownOutlined,
  UpOutlined,
  SearchOutlined,
  GlobalOutlined,
  ProjectOutlined,
  CopyrightOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { CheckMedia, MediaSizes } from "../Utils/MediaQuery";
import {isEmpty} from "../Utils/Utils"
import {
  kTypeOptions,
  kCreditOptions,
  kMimeOptions,
  kRegionOptions
} from "../Utils/FileProperties"

import GoogleLogin from "./GoogleLogin";

const { Header } = Layout;
const { Search } = Input;

const kSearchTypes = {
  txt: 1,
  drpdwn: 2,
  rdio: 3,
  tags: 4,
  chkbx: 5,
};



export const StringToMime = (str)=>{

  if(!str)
    str = "im";

  let tmp = str.match(/.{1,2}/g);
  let ret = [];
  for(let i = 0; i < tmp.length; i++)
  {
    for(let j = 0; j < kMimeOptions.length; j++){
      if(kMimeOptions[j].value.substring(0, 2) === tmp[i]){
        ret.push(kMimeOptions[j].value);
      }
    }
  }
    
  return ret;
}


export const SearchBar = (props) => {
  const searchFields = [
    {
      label: "Name",
      type: kSearchTypes.txt,
      callback: (e) => {
        SetName(e.target.value);
      },
    },
    {
      label: "Project",
      type: kSearchTypes.txt,
      callback: (e) => {
        SetProject(e.target.value);
      },
    },
    {
      label: "Type",
      type: kSearchTypes.drpdwn,
      content: kTypeOptions,
      callback: (value) => {
        console.log(value);
        SetType(value);
      },
    },
    {
      label: "Region",
      type: kSearchTypes.drpdwn,
      content: kRegionOptions,
      callback: (value) => {
        console.log(value);
        SetRegion(value);
      },
    },
    {
      label: "Credit",
      type: kSearchTypes.rdio,
      content: kCreditOptions,
      callback: (e) => {
        console.log(e.target.value);
        SetCredit(e.target.value);
      },
    },
    {
      label: "File Type",
      type: kSearchTypes.chkbx,
      content: kMimeOptions,
    },
  ];

  const [screenSize, setScreen] = useState({
    width: 0,
    height: 0,
  });

  const [expanded, setExpanded] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    window.addEventListener("resize", () => {
      setScreen({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
    setScreen({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const [searchText,SetSearchText] = useState(null);
  const [name, SetName] = useState(null);
  const [project, SetProject] = useState(null);
  const [type, SetType] = useState(null);
  const [region, SetRegion] = useState(null);
  const [credit, SetCredit] = useState(null);
  const [mimeCheckedList, SetMimeCheckedList] = useState(["image"]);

  const [mimeIndeterminate, SetMimeIndeterminate] = useState(true);
  const [mimeCheckAll, SetMimeCheckAll] = useState(false);
  const OnMimeCheckAllChange = (e) => {
    let chcklst = [];
    if (e.target.checked)
      for (let i = 0; i < kMimeOptions.length; i++)
        chcklst.push(kMimeOptions[i].value);
    SetMimeCheckedList(chcklst);
    SetMimeIndeterminate(false);
    SetMimeCheckAll(e.target.checked);
  };
  const OnMimeCheckChange = (checkedlist) => {
    SetMimeCheckedList(checkedlist);
    SetMimeIndeterminate(checkedlist.length !== kMimeOptions.length);
    SetMimeCheckAll(checkedlist.length === kMimeOptions.length);
  };

  const fillFields = () => {
    const children = [];
    for (let i = 0; i < searchFields.length; i++) {
      let fld = searchFields[i];
      let mq = CheckMedia(screenSize.width);
      let w = "45vw";
      if (mq >= MediaSizes.xlarge) w = "22vw";
      if (
        mq <= MediaSizes.medium ||
        fld.type === kSearchTypes.rdio ||
        fld.type === kSearchTypes.chkbx
      )
        w = "95vw";
      children.push(
        <Form.Item
          key={"key-" + fld.label}
          label={mq <= MediaSizes.medium ? "" : fld.label}
          style={{
            width: w,
          }}
          rules={[
            {
              required: false,
              message: "enter " + fld.label,
            },
          ]}
        >
          {fld.type === kSearchTypes.drpdwn && (
            <Select options={fld.content} allowClear onChange={fld.callback} />
          )}
          {fld.type === kSearchTypes.chkbx && (
            <div className="site-checkbox-all-wrapper">
              <Checkbox
                indeterminate={mimeIndeterminate}
                onChange={OnMimeCheckAllChange}
                checked={mimeCheckAll}
              >
                Check All
              </Checkbox>
              <Checkbox.Group
                options={fld.content}
                value={mimeCheckedList}
                onChange={OnMimeCheckChange}
              />
            </div>
          )}
          {fld.type === kSearchTypes.rdio && (
            <Radio.Group
              options={fld.content}
              optionType="button"
              buttonStyle="solid"
              onChange={fld.callback}
            />
          )}
          {fld.type === kSearchTypes.txt && (
            <Input
              placeholder={"Search by " + fld.label}
              prefix={fld.name}
              onChange={fld.callback}
            />
          )}
        </Form.Item>
      );
    }

    return children;
  };

  const onFinish = (values) => {
    console.log("Received values: ", values);
  };



  const getCheckedList = (mlist) => {
    let tmp = [];
    for (let i = 0; i < kMimeOptions.length; i++)
      tmp.push({
        name: kMimeOptions[i].value,
        value: mlist.includes(kMimeOptions[i].value),
      });
    return tmp;
  };
  
  const mimeToString = (mime)=>{
    let m = "";
    for(let i = 0; i < mime.length; i++){
      m += mime[i].substring(0, 2);
    }
    return m;
  }

  let history = useHistory();
  const onSearch = (values) => {
    console.log(values);
    if (isEmpty(values)) {
      message.warning("Empty Search!");
      return;
    }
    SetSearchText(values);
    let tmp = {
      text: values,
      name: isEmpty(name) ? null : name,
      project: isEmpty(project) ? null : project,
      type: isEmpty(type) ? null : type,
      region: isEmpty(region) ? null : region,
      credit: isEmpty(credit) ? null : credit,
      mime: mimeCheckedList,
    };
    console.log(tmp);
    let h = "/search/?s=" + values;
    if (tmp.name) h += "&n=" + tmp.name;
    if (tmp.project) h += "&p=" + tmp.project;
    if (tmp.type) h += "&t=" + tmp.type;
    if (tmp.region) h += "&r=" + tmp.region;
    if (tmp.credit) h += "&c=" + tmp.credit;
    h+="&m="+mimeToString(mimeCheckedList);
    history.push(h);
    props.SetSearchPrams(tmp);
  };

  const getHeaderHeight = (isexpanded) => {
    let mq = CheckMedia(screenSize.width);
    let h = "24vh";
    if (mq >= MediaSizes.xlarge) h = "18vh";
    if (mq <= MediaSizes.medium) h = "34vh";
    if (!isexpanded) h = screenSize.width < 731 ? "8vh" : "6vh";
    return {
      height: h,
      width: "100%",
      padding: "4px",
    };
  };

  const expandButtonContent = () => {
    let tmp = expanded ? "- " : "+ ";
    tmp += screenSize.width < 750 ? "Adv Srch" : "Advanced Search";
    if (screenSize.width < 500) tmp = expanded ? "v " : "^ ";
    return tmp;
  };

  useEffect(()=>{
    console.log("Search Updated")
    console.log(props.LoadedPrams)
    SetSearchText(props.LoadedPrams.text?props.LoadedPrams.text:null)
    SetName(props.LoadedPrams.name?props.LoadedPrams.name:null);
    SetProject(props.LoadedPrams.project?props.LoadedPrams.project:null);
    SetType(props.LoadedPrams.type?props.LoadedPrams.type:null);
    SetRegion(props.LoadedPrams.region?props.LoadedPrams.region:null);
    SetCredit(props.LoadedPrams.credit?props.LoadedPrams.credit:null);
    SetMimeCheckedList(props.LoadedPrams.mime?props.LoadedPrams.mime:StringToMime("im"));
  },[props.LoadedPrams])

  return (
    <Header style={getHeaderHeight(expanded)} className="App-header">
      <Row
        style={{
          width: "100%",
          lineHeight: "2vh",
          padding: "8px",
        }}
      >
        <Col span={4}>
          {screenSize.width < 320 ? (
            <span> Fluidity </span>
          ) : (
            <span>Fluidity Photo DB</span>
          )}
        </Col>
        <Col span={1}></Col>
        <Col span={17}>
          <Row>
            <Col span={19}>
              <Search
                placeholder="input search text"
                onSearch={onSearch}
                value={searchText}
                onChange={(e)=>{SetSearchText(e.target.value)}}
                enterButton
              />
            </Col>
            <Col span={1}>
        </Col>
            <Col span={3}>
              <Button
                onClick={() => {
                  setExpanded(!expanded);
                }}
              >
                {expandButtonContent()}
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={1}>

          <GoogleLogin setnewuser={props.SetCurrentUser}/>
        </Col>

      </Row>
      {expanded && (
        <Row
          style={{
            width: "100%",
            lineHeight: "2vh",
            padding: "8px",
          }}
        >
          <Col span={24}>
            <Form
              form={form}
              name="search-bar"
              className="header-search-bar"
              onFinish={onFinish}
              layout="inline"
            >
              {fillFields()}
            </Form>
          </Col>
        </Row>
      )}
    </Header>
  );
};

