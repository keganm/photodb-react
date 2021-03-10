import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  Card,
  Button,
  Row,
  Col,
  Menu,
  Dropdown,
  message,
  Checkbox,
} from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  MenuOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { Image } from "antd";

import { MediaSizes, CheckMedia } from "../Utils/MediaQuery";

import { GoogleDrive, QUERIES } from "./GoogleDrive";
import { GoogleParents } from "./parentManager";
import { ImageCard } from "./ImageCard";
import { SideBar } from "./Sidebar";
import { kMimeOptions } from "../Utils/FileProperties";
import { MoveToModal } from "./MoveToModal";
const { Meta } = Card;
const { SubMenu } = Menu;

export const Images = (props) => {
  const [screenWidth, SetScreenWidth] = useState(window.innerWidth);
  const [files, setFiles] = useState(null);
  const [selectionMode, SetSelectionMode] = useState(false);
  const [selectionSet, SetSelectionSet] = useState([]);
  const [isSelectAll, SetSelectAll] = useState(false);
  const [filters, SetFilters] = useState(["image"]);
  const [indeterminate, SetIndeterminate] = useState(true);
  const [checkAll, SetCheckAll] = useState(false);

  const mySideBar = useRef(null);
  useEffect(() => {
    window.addEventListener("resize", () => {
      SetScreenWidth(window.innerWidth);
    });
  }, []);

  function IsReady() {
    return props.currentFolder && props.photoFolder && props.gapiInterface;
  }

  function OnFileListReturned(list) {
    SetSelectionMode(false);
    list.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (GoogleParents && GoogleParents.isStructured) {
      for (let i = 0; i < list.length; i++) {
        list[i].parentName = GoogleParents.FindById(list[i].parents[0]).name;
      }
    }
    setFiles(list);
  }

  function GetFiles() {
    if (!IsReady()) return;
    console.log("Get Files");
    if (props.isSearchInterface)
      GoogleDrive.GetFileList(OnFileListReturned, {
        query: QUERIES.SearchQuery(props.searchPrams),
      });
    else
      GoogleDrive.GetFileList(OnFileListReturned, {
        query:
          QUERIES.NoFolders() + " and " + QUERIES.ParentIs(props.currentFolder),
      });
  }

  function ReloadImages() {
    GetFiles();
  }

  useEffect(() => {
    if (!props.photoFolder) return;
    console.log(props.photoFolder);
    GetFiles();
  }, [
    props.searchPrams,
    props.photoFolder,
    props.currentFolder,
    props.gapiInterface,
  ]);
  useEffect(() => {
    console.log(mySideBar);
  }, [mySideBar]);

  function ShowFiles() {
    return files == null ? false : files.length > 0;
  }

  const ModifySelectionSet = (selected, img) => {
    let indx = selectionSet.findIndex((crnt) => crnt.id === img.id);

    if (selected) {
      if (indx === -1) {
        let tmp = selectionSet;
        tmp.push(img);
        SetSelectionSet(tmp);
      }
    } else {
      if (indx > -1) {
        let tmp = selectionSet;
        tmp.splice(indx, 1);
        SetSelectionSet(tmp);
      }
    }
  };

  const ClearSelection = () => {
    console.log("Clear Selection");
    SetSelectAll(false);
  };

  const SelectAll = () => {
    SetSelectAll(true);
  };

  function SortToCol(count) {
    if (count === 1) {
      return [files];
    }

    let cols = [];

    if (files.length <= count) {
      for (let i = 0; i < count; i++) cols.push(files[i] ? [files[i]] : null);
      return cols;
    }

    for (let i = 0; i < count; i++) cols.push([]);

    if (files.length <= count * 2) {
      for (let i = 0; i < files.length; i++) {
        let ti = i;
        while (ti >= count) {
          ti -= count;
        }

        cols[ti].push(files[i]);
      }
      return cols;
    }

    let trgtmax = 0.25;
    let coltrgt = 0;
    let accum = 0;
    let maxaccum = trgtmax;
    let accumthresh = 0.1;

    for (let i = 0; i < files.length; i++) {
      let meta = files[i].imageMediaMetadata;
      let ratio = meta ? meta.height / meta.width : 1;
      if (!meta || meta.height === 0 || meta.width === 0) ratio = 1;

      cols[coltrgt].push(files[i]);
      accum += ratio;

      if (accum >= maxaccum - accumthresh) {
        maxaccum = (trgtmax + accum) / 2;
        coltrgt++;
        accum = 0;
        if (coltrgt >= count) {
          coltrgt = 0;
        }
      }
    }
    return cols;
  }

  const [isVisible, setVisible] = useState(true);
  const [currentInfo, SetCurrentInfo] = useState(null);

  const ShowSideBar = (info) => {
    if (!info) return;
    SetCurrentInfo(info);
    setVisible(true);
  };

  function GetCol(col) {
    if (col)
      return col.map((item) =>
        ImageCard(
          {
            isSearchInterface: props.isSearchInterface,
            showSideBar: ShowSideBar,
            screenWidth: screenWidth,
            SetCurrentFolder: props.SetCurrentFolder,
            selectionMode: selectionMode,
            ModifySelectionSet: ModifySelectionSet,
            isSelectAll: isSelectAll,
            SearchByTag: SearchByTag,
            filters:filters,
          },
          item
        )
      );
    return col;
  }

  function RatioBasedColumms() {
    let count = CheckMedia(screenWidth);

    let tmparray = [];
    for (var i = 0; i < count; i++) tmparray.push(i);

    let cols = SortToCol(count);

    if (!cols[cols.length - 1]) count--;
    else if (cols[cols.length - 1] && cols[cols.length - 1].length <= 0)
      count--;

    let span = Math.floor(24 / count);
    return cols.map((col, index) => {
      if (col && col.length > 0)
        return (
          <Col key={index} span={span}>
            {GetCol(col)}
          </Col>
        );
      return (
        <Col key={index} span={span}>
          <> </>
        </Col>
      );
    });
  }


  let history = useHistory();
  function SearchByTag(tag){
    
    let tmp = {
      text: tag,
      name: null,
      project: null,
      type: null,
      region: null,
      credit: null,
      mime: ["image"],
    };
    console.log(tmp);
    let h = "/search/?s=" + tag;
    h+="&m=im";
    history.push(h);
    props.SetSearchPrams(tmp);
  }
  function handleMenuClick(e) {}

  const OnFilterChange = list =>{
    SetFilters(list);
    SetIndeterminate(!!list.length && list.length < kMimeOptions.length);
    SetCheckAll(list.length === kMimeOptions.length);
  }

  const OnCheckAllChange = e =>{
    let l = [];
    for(let i = 0; i < kMimeOptions.length; i++)
      l.push(kMimeOptions[i].value);
    SetFilters(e.target.checked ? l:[]);
    SetIndeterminate(false)
    SetCheckAll(e.target.checked)
  }

  const FilterMenu = (
    <SubMenu title="filter">
    <Checkbox.Group className="filterContext" value={filters} options={kMimeOptions} onChange={OnFilterChange}/>
    <Checkbox indeterminate={indeterminate} onChange={OnCheckAllChange} checked={checkAll} style={{display: "block", paddingLeft: "6px"}}>
      Check All
    </Checkbox>
    </SubMenu>
  )

  const ImageMenu = (
    <Menu onClick={handleMenuClick}>
    {FilterMenu}
    {selectionMode && 
    <Menu.Item key="edit" onClick={()=>{ShowSideBar(selectionSet[0])}}>
      Edit Selection
    </Menu.Item>
    }
      <Menu.Item key="ignore">
        <Checkbox
          checked={selectionMode}
          onChange={(e) => {
            if (!e.target.checked) SetSelectionSet([]);
              SetSelectionMode(e.target.checked);
          }}
        >
          Select Multiple
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="selectall">
        <Checkbox
          checked={isSelectAll}
          onChange={(e) => {
            SetSelectAll(e.target.checked);
          }}
        >
          Select All
        </Checkbox>
      </Menu.Item>
    </Menu>
      
  );

  return (
    <>
    <Dropdown trigger={['contextMenu']} overlay={ImageMenu}>
    <div>
      {ShowFiles() && (
        <Card
          title="Images"
          style={{
          }}
        >
          <Row>
            <RatioBasedColumms />
          </Row>
        </Card>
      )}
</div>
      </Dropdown>
      <SideBar
        isSearchInterface={props.isSearchInterface}
        isVisible={isVisible}
        setVisible={setVisible}
        selectionSet={selectionSet}
        currentInfo={currentInfo}
        ReloadImages={ReloadImages}
      />
      <MoveToModal
        gapiInterface = {props.gapiInterface}
      />
    </>
  );
};
