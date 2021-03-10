import React, { useState, useEffect } from "react";

import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

import { GoogleParents } from "./parentManager";
import { Link } from "react-router-dom";

export const FolderBreadcrumb = (props) => {
  const [isStruct, SetIsStruct] = useState(null);
  const [BreadcrumbList, SetBreadcrumbList] = useState(null);

  function IsReady() {
    return props.currentFolder && props.photoFolder && props.gapiInterface.isInit;
  }

  useEffect(() => {
    if (IsReady()) {
      if (GoogleParents) {
        GoogleParents.AddGetParentsCalback(props.currentFolder, (res) => {
          console.log(res);
          SetBreadcrumbList(res);
        });
      }
    }
  }, [props.currentFolder]);

  useEffect(() => {
    console.log("IsStruct Changed: " + isStruct);
  }, [isStruct]);

  return (
    <Breadcrumb>
      {BreadcrumbList &&
        BreadcrumbList.map((crumb, index) => (
          <Breadcrumb.Item key={index}>
            <Link to={"/folders/?id=" + crumb.id}>
              {crumb.id === props.photoFolder.id && <HomeOutlined />}
              {crumb.id !== props.photoFolder.id && crumb.name}
            </Link>
          </Breadcrumb.Item>
        ))}
        
      <Breadcrumb.Item>
        {GoogleParents.isStructured && !props.isSearch && (
          <>
            {props.currentFolder !== props.photoFolder.id &&
              GoogleParents.FindById(props.currentFolder).name}
          </>
        )}
      </Breadcrumb.Item>

      {props.isSearch &&
        (<Breadcrumb.Item>
          <Link to={"/"}>
          {props.currentFolder === props.photoFolder.id && <HomeOutlined />}
          </Link>
      </Breadcrumb.Item>)}
    </Breadcrumb>
  );
};
