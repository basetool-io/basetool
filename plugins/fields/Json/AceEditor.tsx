import dynamic from "next/dynamic";

const AceEditor = dynamic(
  async () => {
    const reactAce = await import("react-ace");

    // prevent warning in console about misspelled props name.
    await import("ace-builds/src-min-noconflict/ext-language_tools");

    // import your theme/mode here. <AceEditor mode="javascript" theme="solarized_dark" />
    await import("ace-builds/src-min-noconflict/mode-json");
    await import("ace-builds/src-min-noconflict/theme-github");

    // as @Holgrabus commented you can paste these file into your /public folder.
    // You will have to set basePath and setModuleUrl accordingly.
    const ace = require("ace-builds/src-min-noconflict/ace");
    ace.config.set(
      "basePath",
      "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/"
    );
    ace.config.setModuleUrl(
      "ace/mode/json_worker",
      "https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-json.js"
    );

    return reactAce;
  },
  {
    ssr: false // react-ace doesn't support server side rendering as it uses the window object.
  }
);

export default (props) =>  <AceEditor
  name={props.name}
  placeholder={props.placeholder}
  mode="json"
  theme="github"
  defaultValue={props.defaultValue}
  height="300px"
  width="500px"
  wrapEnabled={true}
  readOnly={props.readOnly}
  onChange={props.onChange}
  editorProps={{ $blockScrolling: true }} />
