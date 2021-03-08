import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Drawer,
  Typography,
  Button,
  BackTop,
  Row,
  Col,
  Divider,
  Select,
  Space,
} from "antd";
import {
  FileImageFilled,
  FileImageOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { GoogleDrive, QUERIES } from "./GoogleDrive";

import {
  kTypeOptions,
  kCreditOptions,
  kMimeOptions,
  kRegionOptions,
} from "../Utils/FileProperties";
import { EditableTagGroup } from "./EditableTagGroup";
import { GoogleParents } from "./parentManager";
import { Link } from "react-router-dom";

const Option = Select.Option;
const { Paragraph } = Typography;
export const SideBar = (props) => {
  const [fntName, SetFntName] = useState(null);
  const [fileExt, SetFileExt] = useState(null);
  const [fntProject, SetFntProject] = useState(null);
  const [fntType, SetFntType] = useState(null);
  const [fntRegion, SetFntRegion] = useState(null);
  const [fntCredit, SetFntCredit] = useState(null);
  const [fntTags, SetFntTags] = useState(["test", "my", "tags"]);

  const [parentFolder, SetParentFolder] = useState("");


  const [fileMeta, SetFileMeta] = useState(null);


  /**
   * UTILITIES
   */
  const removeFileType = (str) => {
    let tmp = str.split(".");

    SetFileExt(tmp[tmp.length - 1]);

    let ret = "";
    for (let i = 0; i < tmp.length - 1; i++) ret += tmp[i] + ".";
    return ret.slice(0, -1);
  };

  const descriptionToTags = (it) => {
    let tmp = it.split(",");
    for (let i = tmp.length - 1; i >= 0; i--) {
      let str = tmp[i].trim();
      if (str.length > 0) tmp[i] = str;
      else tmp.splice(i, 1);
    }
    return tmp;
  };
  const tagsToDescription = (ta) => {
    let tmp = "";
    for (let i = 0; i < ta.length; i++) tmp += ta[i] + ",";
    tmp = tmp.slice(0, -1);
    return tmp;
  };

  const toggleDrawer = () => {
    props.setVisible(!props.isVisible);
  };
  const showDrawer = () => {
    props.setVisible(true);
  };
  const hideDrawer = () => {
    props.setVisible(false);
  };

 
  /**
   * 
   * FUNCTIONAL
   * 
   */

  /**
   * Fill The Form in
   */
  const fillForm = () => {
    SetFntName(removeFileType(fileMeta.name));

    if (fileMeta.properties) {
      SetFntProject(
        fileMeta.properties.project
          ? fileMeta.properties.project
          : null
      );
      SetFntType(
        fileMeta.properties.type
          ? fileMeta.properties.type
          : null
      );
      SetFntRegion(
        fileMeta.properties.region
          ? fileMeta.properties.region
          : null
      );
      SetFntCredit(
        fileMeta.properties.credit
          ? fileMeta.properties.credit
          : null
      );
    }else{
      SetFntProject(null);
      SetFntType(null);
      SetFntRegion(null);
      SetFntCredit(null);
    }

    if (
      fileMeta.parents &&
      GoogleParents &&
      GoogleParents.isStructured
    )
      SetParentFolder(
        GoogleParents.FindById(fileMeta.parents[0]).name
      );

    if (fileMeta.description)
      SetFntTags(descriptionToTags(fileMeta.description));
    else SetFntTags([]);

    showDrawer();
  };
  
  /**
   * On Submit
   */
  const onSubmitClicked = () => {
    console.log(props);

    let successCount = 0;

    let t = fntTags.length > 0 ? tagsToDescription(fntTags) : null;
    let p = {};
    if (fntProject) p["project"] = fntProject;
    if (fntType) p["type"] = fntType;
    if (fntRegion) p["region"] = fntRegion;
    if (fntCredit) p["credit"] = fntCredit;
    if (Object.keys(p).length === 0) p = null;

    if(props.selectionSet.length > 0){
      let paddnum = ("" + props.selectionSet.length).length;
      for(let i = 0; i < props.selectionSet.length; i++)
      {
        let ext = props.selectionSet[i].name.split('.');
        ext = ext[ext.length-1];
        let pad = ''+(i+1);
        let n = fntName + "_" + pad.padStart(paddnum,'0') + "." + ext;

        setTimeout(()=>{
          GoogleDrive.UpdateFileContents(props.selectionSet[i].id, n, t, p, (resp) => {
            console.log(resp);
            successCount++;
            if(successCount >= props.selectionSet.length)
              onSubmitSuccess();
          });},Math.random()*4000+500);
      }
    }
    else{
      let n = fntName + "." + fileExt;

      GoogleDrive.UpdateFileContents(fileMeta.id, n, t, p, (resp) => {
        console.log(resp);
        onSubmitSuccess();
      });
    }

    
  };

  const onSubmitSuccess = () =>{
    console.log("Submit Success!");
    props.ReloadImages();
  }
  

  /**
   * Built Ins
   */

  useEffect(() => {
    console.log(props.currentInfo)
    console.log(props.selectionSet)
    if (props.currentInfo)
      SetFileMeta(props.currentInfo);
  }, [props.currentInfo]);


  useEffect(()=>{
    if(fileMeta)
      fillForm();
  },[fileMeta])


  /**
   * RETURNS
   * 
   */

  return (
    <div>
      <div className="floating-button-bot-right">
        <Button
          onClick={() => {
            toggleDrawer();
          }}
        >
          <InfoCircleOutlined />
        </Button>
      </div>
      {props.currentInfo && (
        <Drawer
          title={fntName ? fntName + "." + fileExt : ""}
          placement="right"
          closable={true}
          onClose={hideDrawer}
          visible={props.isVisible}
          getContainer={false}
          width={450}
          style={{ textAlign: "center" }}
        >
          {props.currentInfo.hasThumbnail ? (
            <img src={props.currentInfo.thumbnailLink.replace("s220", "s400")} alt="thumbnail view" />
          ) : (
            <FileImageOutlined
              style={{ fontSize: "120px", textAlign: "center", width: "100%" }}
            />
          )}

          {props.currentInfo.imageMediaMetadata ? (
            <div style={{ fontSize: "0.75em" }}>
              {props.currentInfo.imageMediaMetadata.width}x
              {props.currentInfo.imageMediaMetadata.height}
            </div>
          ) : (
            <div />
          )}
          <Paragraph
            style={{ fontSize: "1.5em", fontWeight: "bold" }}
            editable={{ onChange: SetFntName }}
          >
            {fntName ? fntName : ""}
          </Paragraph>
          {props.isSearchInterface && (
            <Row gutter={[8, 16]} style={{ width: "100%" }}>
              <Col flex="75px" style={{ textAlign: "right" }}>
                Go to
              </Col>
              <Col flex="auto">
                <Link to={"/folders/?id=" + props.currentInfo.parents[0]}>
                  <Button block>{parentFolder}</Button>
                </Link>
              </Col>
            </Row>
          )}

          <Divider plain style={{ color: "#9ce" }}>
            Info
          </Divider>
          <Row gutter={[8, 16]}>
            <Col flex="100px">Project:</Col>
            <Col flex="auto">
              <Paragraph editable={{ onChange: SetFntProject }}>
                {fntProject ? fntProject : ""}
              </Paragraph>
            </Col>
          </Row>

          <Row gutter={[8, 16]}>
            <Col flex="100px">Type:</Col>
            <Col flex="auto">
              <Select
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Fountain Type"
                options={kTypeOptions}
                value={fntType}
                filterOption={(input, option) =>
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(val) => {
                  SetFntType(val);
                }}
              ></Select>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col flex="100px">Region:</Col>
            <Col flex="auto">
              <Select
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Region of Feature"
                options={kRegionOptions}
                value={fntRegion}
                filterOption={(input, option) =>
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(val) => {
                  SetFntRegion(val);
                }}
              ></Select>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col flex="100px">Credit:</Col>
            <Col flex="auto">
              <Select
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Image Credit"
                options={kCreditOptions}
                value={fntCredit}
                filterOption={(input, option) =>
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(val) => {
                  SetFntCredit(val);
                }}
              ></Select>
            </Col>
          </Row>

          <EditableTagGroup
            tags={fntTags}
            SetTags={SetFntTags}
          ></EditableTagGroup>

          <div className="sidebar-formbuttons">
            <Space>
              <Button>Cancel</Button>

              <Button type="primary" onClick={() => onSubmitClicked()}>
                Submit
              </Button>
            </Space>
          </div>
        </Drawer>
      )}
    </div>
  );
};
