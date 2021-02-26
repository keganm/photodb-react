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
    SetFntName(removeFileType(props.currentInfo.name));

    if (props.currentInfo.properties) {
      SetFntProject(
        props.currentInfo.properties.project
          ? props.currentInfo.properties.project
          : null
      );
      SetFntType(
        props.currentInfo.properties.type
          ? props.currentInfo.properties.type
          : null
      );
      SetFntRegion(
        props.currentInfo.properties.region
          ? props.currentInfo.properties.region
          : null
      );
      SetFntCredit(
        props.currentInfo.properties.credit
          ? props.currentInfo.properties.credit
          : null
      );
    }else{
      SetFntProject(null);
      SetFntType(null);
      SetFntRegion(null);
      SetFntCredit(null);
    }

    if (
      props.currentInfo.parents &&
      GoogleParents &&
      GoogleParents.isStructured
    )
      SetParentFolder(
        GoogleParents.FindById(props.currentInfo.parents[0]).name
      );

    if (props.currentInfo.description)
      SetFntTags(descriptionToTags(props.currentInfo.description));
    else SetFntTags([]);

    showDrawer();
  };
  
  /**
   * On Submit
   */
  const onSubmitClicked = () => {
    console.log(props);

    let n = fntName + "." + fileExt;
    let t = fntTags.length > 0 ? tagsToDescription(fntTags) : null;
    let p = {};
    if (fntProject) p["project"] = fntProject;
    if (fntType) p["type"] = fntType;
    if (fntRegion) p["region"] = fntRegion;
    if (fntCredit) p["credit"] = fntCredit;
    if (Object.keys(p).length === 0) p = null;

    GoogleDrive.UpdateFileContents(props.currentInfo.id, n, t, p, (resp) => {
      console.log(resp);
    });
  };
  

  /**
   * Built Ins
   */

  useEffect(() => {
    if (props.currentInfo) fillForm();
  }, [props.currentInfo]);

  useEffect(()=>{

  })


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
            <img src={props.currentInfo.thumbnailLink} alt="thumbnail view" />
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
          {parentFolder && props.isSearchInterface && (
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
