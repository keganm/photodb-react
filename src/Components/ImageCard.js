import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Switch,
  Checkbox,
  Skeleton,
  Tag,
  Typography,
  Menu,
  Dropdown,
} from "antd";
import {
  CloseSquareOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileTwoTone,
  FileZipTwoTone,
  LoadingOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { Link } from "react-router-dom";
import { Image } from "antd";

import { MediaSizes, CheckMedia } from "../Utils/MediaQuery";

import { GoogleDrive, QUERIES } from "./GoogleDrive";
import { GoogleParents } from "./parentManager";
import {
  kCreditOptions,
  kRegionOptions,
  kTypeOptions,
} from "../Utils/FileProperties";

const { Meta } = Card;
const { Text } = Typography;
const ImageLoader = (props, src, CloseOverlay) => {
  const [isLoaded, SetIsLoaded] = useState(false);

  return (
    <React.Fragment>
      <div
        className="vertical-center"
        style={{
          visibility: isLoaded ? "hidden" : "visible",
          color: "#1890ff",
        }}
      >
        <div
          style={{
            width: "100vw",
            fontSize: "120px",
          }}
        >
          <LoadingOutlined />
        </div>
        <div
          style={{
            width: "100vw",
            fontSize: "32px",
          }}
        >
          Loading...
        </div>
      </div>

      <Button
        className="imagecard-overlay-closebutton"
        onClick={() => {
          CloseOverlay();
        }}
      >
        <CloseSquareOutlined />
      </Button>
      <>
        {src.type !== "img" && (
          <iframe
            onLoad={() => {
              SetIsLoaded(true);
            }}
            className="vertical-center"
            style={{ opacity: isLoaded ? 1 : 0 }}
            alt={props.name}
            src={src.src}
          />
        )}
        {src.type === "img" && (
          <img
            onLoad={() => {
              SetIsLoaded(true);
            }}
            className="vertical-center"
            style={{ opacity: isLoaded ? 1 : 0 }}
            alt={props.name}
            src={src.src}
          />
        )}
      </>
    </React.Fragment>
  );
};

export const ImageCard = (args, props) => {
  const cardEle = useRef(null);

  var clickTimeout = null;

  const [isFocused, SetIsFocused] = useState(false);
  const [originalHeight, SetOriginalHeight] = useState(null);
  const [marginOffset, SetMarginOffset] = useState(null);
  const [fullSizeSrc, SetFullSizeSrc] = useState({ src: null, type: null });
  const [showPreview, SetShowPreview] = useState(false);
  const [selected, SetSelected] = useState(
    props.isSelected ? props.isSelected : false
  );
  const [wasSelectAll, setWasSelectAll] = useState(false);
  const [reload, SetReload] = useState(false);
  const [inFilter, SetInFilter] = useState(false);

  let style = {
    textAlign: "center",
    padding: "4px",
    width: "100%",
  };

  function rowStyle() {
    return {
      position: "sticky",
      zIndex: 2,
      marginBottom: marginOffset ? marginOffset + "px" : "-16vh",
    };
  }

  function loadInImage() {
    if (cardEle) SetOriginalHeight(cardEle.current.clientHeight);
    SetFullSizeSrc({
      src: props.webViewLink.replace("/view?usp=drivesdk", "/preview"),
      type: "page",
    });
    /*
    SetFullSizeSrc(
      "https://drive.google.com/u/0/uc?id=" + props.id + "&export=download"
    );*/
    console.log(props);
    SetIsFocused(false);
  }
  useEffect(() => {
    if (cardEle && originalHeight)
      SetMarginOffset(originalHeight - cardEle.current.clientHeight);
  }, [originalHeight]);
  useEffect(()=>{
    let match = false;
    for(let i = 0; i<args.filters.length; i++)
    {
      if(props.mimeType.includes(args.filters[i]))
        match = true;
    }
    SetInFilter(match);
  }, [args.filters])

  function CardClicked(e) {
    console.log("Card Clicked");

    if (!isFocused) SetIsFocused(true);
    else {
      loadInImage();
      SetShowPreview(true);
    }
  }

  function CardDoubleClicked(e) {
    console.log("Card Double Clicked");
    SetFullSizeSrc({
      src:
        "https://drive.google.com/u/0/uc?id=" + props.id + "&export=download",
      type: "img",
    });
    SetShowPreview(true);
  }

  useEffect(() => {
    console.log("Reloading");
    SetReload(false);
  }, [reload]);

  /**
   * Overlay image shown on click
   * TODO:expand functionality of this area (Close, Zoom,etc)
   */

  const CloseOverlay = () => {
    SetShowPreview(false);
    SetIsFocused(false);
  };
  const PreviewOVerlay = (
    <div
      className="imagecard-overlay-base"
      onClick={(e) => {
        CloseOverlay();
      }}
    >
      {ImageLoader(props, fullSizeSrc, CloseOverlay)}
    </div>
  );

  /**
   * Meta data to be added below image on hover
   */
  const MetaData = (
    <Meta
      className="imagecard-meta"
      title={props.name}
      description={
        props.imageMediaMetadata
          ? props.imageMediaMetadata.width +
            "x" +
            props.imageMediaMetadata.height
          : ""
      }
    />
  );

  const getLabel = (options, prop) => {
    let opt = options.find((r) => r.value === prop);
    if (!opt) opt = options.find((r) => r.label === prop);
    if (!opt) return null;
    return opt.label;

    //kTypeOptions.find(r => r.value === props.properties.type).label
  };
  const projectMeta = (
    <Button type="text" className="imagecard-meta-label">
      {props.properties ? (
        props.properties.project ? (
          <>
            <Text style={{ fontSize: "small", float: "left" }} type="secondary">
              Project:
            </Text>
            <Text>{props.properties.project}</Text>
          </>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </Button>
  );
  const typeMeta = (
    <Button type="text" className="imagecard-meta-label">
      {props.properties ? (
        props.properties.type ? (
          <>
            <Text style={{ fontSize: "small", float: "left" }} type="secondary">
              Type:
            </Text>
            <Text>{getLabel(kTypeOptions, props.properties.type)}</Text>
          </>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </Button>
  );
  const regionMeta = (
    <Button type="text" className="imagecard-meta-label">
      {props.properties ? (
        props.properties.region ? (
          <>
            <Text style={{ fontSize: "small", float: "left" }} type="secondary">
              Region:
            </Text>
            <Text>{getLabel(kRegionOptions, props.properties.region)}</Text>
          </>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </Button>
  );
  const creditMeta = (
    <Button type="text" className="imagecard-meta-label">
      {props.properties ? (
        props.properties.credit ? (
          <>
            <Text style={{ fontSize: "small", float: "left" }} type="secondary">
              Credit:
            </Text>
            <Text>{getLabel(kCreditOptions, props.properties.credit)}</Text>
          </>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </Button>
  );

  const descriptionToTags = (it) => {
    let tmp = it.split(",");
    for (let i = tmp.length - 1; i >= 0; i--) {
      let str = tmp[i].trim();
      if (str.length > 0) tmp[i] = str;
      else tmp.splice(i, 1);
    }
    return tmp;
  };
  const tagsMeta = (
    <div>
      {props.description
        ? descriptionToTags(props.description).map((tag, index) => (
            <Tag
              key={index}
              onClick={() => {
                args.SearchByTag(tag);
              }}
            >
              {tag}
              {/* 
            <Link to={"/search/?s=" + tag + "&m=im"}>
            {tag}
            </Link>*/}
            </Tag>
          ))
        : ""}
    </div>
  );

  /**
   * Cover Image and connection to Click & Double click of Image
   */
  const CoverImage = props.hasThumbnail ? (
    <img
      className={selected ? "imagecard-selected" : ""}
      alt={props.name}
      onMouseUp={(e) => {}}
      onClick={(e) => {
        if (clickTimeout) clearTimeout(clickTimeout);

        if (e.ctrlKey || args.selectionMode) {
          props.isSelected = !props.isSelected;
          UpdateSelection();
        } else
          clickTimeout = setTimeout(
            () => CardClicked(e),
            process.env.REACT_APP_DOUBLECLICK_TIMER
          );
      }}
      onDoubleClick={(e) => {
        if (clickTimeout) clearTimeout(clickTimeout);
        CardDoubleClicked(e);
      }}
      src={props.thumbnailLink.replace("s220", "s400")}
      onError={(e) => {
        console.log("reloading",e.currentTarget);
        setTimeout(() => {
          SetReload(true);
        }, Math.random() * 4000 + 2000);
      }}
    />
  ) : props.mimeType.includes("zip") ? (
    <FileZipTwoTone
      style={{ fontSize: "120px", paddingTop: "20px", paddingBottom: "40px" }}
    />
  ) : (
    <FileTwoTone
      style={{ fontSize: "120px", paddingTop: "20px", paddingBottom: "40px" }}
    />
  );

  /**
   * Selection Box only visible in Selection Mode
   */
  const SelectionBox = (
    <Checkbox
      className="imagecard-selector"
      size="small"
      checked={selected}
      defaultChecked={selected}
      onChange={(e) => {
        console.log("SelectionBox");
        props.isSelected = e.target.checked;
        UpdateSelection();
      }}
    />
  );

  const UpdateSelection = () => {
    SetSelected(props.isSelected);
    args.ModifySelectionSet(props.isSelected, props);
  };

  useEffect(() => {
    if (args.isSelectAll != wasSelectAll) {
      if (args.isSelectAll) props.isSelected = true;
      else props.isSelected = false;
      UpdateSelection();
    }
    setWasSelectAll(args.isSelectAll);
  }, [args.isSelectAll]);

  /**
   * Dropdown for action bar
   */
  const ImageDropdownMenu = (
    <Menu>
      <Menu.Item>
      {props.parents && args.isSearchInterface &&
        <Link to={"/folders/?id=" + props.parents[0]}>
          {GoogleParents.FindById(props.parents[0]) && (
            <Button block>
              Go To: {GoogleParents.FindById(props.parents[0]).name}
            </Button>
          )}
          {!GoogleParents.FindById(props.parents[0]) && (
            <Button block>Go To Folder</Button>
          )}
        </Link>}
      </Menu.Item>
    </Menu>
  );

  /**
   * Action Bar at bottom of Image Card
   */
  const ActionBar = [
    <CloudDownloadOutlined
      key="download"
      onClick={() => {
        window.open(
          "https://drive.google.com/u/0/uc?id=" + props.id + "&export=download",
          "_blank"
        );
        console.log("download");
      }}
    />,
    <Dropdown overlay={ImageDropdownMenu} placement="topCenter">
    <EllipsisOutlined key="ellipsis" />
    </Dropdown>,
    <EditOutlined
      key="edit"
      onClick={() => {
        console.log("Edit Clicked");
        if (!selected) {
          props.isSelected = true;
          UpdateSelection();
        }
        if (args.showSideBar) args.showSideBar(props);
      }}
    />
  ];

  return (<>
    {inFilter &&
    <Row style={isFocused && rowStyle()} key={props.id}>
      <Col ref={cardEle} span={24}>
        {!reload && (
          <Card
            hoverable={true}
            className={"image-card"}
            style={style}
            cover={CoverImage}
            onMouseDown={() => {
              //loadInImage();
            }}
            onMouseLeave={() => {
              setTimeout(() => {
                SetIsFocused(false);
              }, 100);
            }}
            onBlur={() => {
              setTimeout(() => {
                SetIsFocused(false);
              }, 100);
            }}
            actions={isFocused && ActionBar}
          >
            {isFocused && MetaData}
            {isFocused && projectMeta}
            {isFocused && typeMeta}
            {isFocused && regionMeta}
            {isFocused && creditMeta}
            {isFocused && tagsMeta}
            {showPreview && PreviewOVerlay}
            {args.selectionMode && SelectionBox}
          </Card>
        )}
      </Col>
    </Row>
    }</>
  );
};
