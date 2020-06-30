import React, { Component } from "react";
import { Button, Progress } from "reactstrap";
import { Link } from "react-router-dom";

import config from "./config";
import ControlsModal from "./ControlsModal";
import Emulator from "./Emulator";
import RomLibrary from "./RomLibrary";
import Anime4K from "anime4K"
import "./RunPage.css";

function loadBinary(path, callback, handleProgress) {
  var req = new XMLHttpRequest();
  req.open("GET", path);
  req.overrideMimeType("text/plain; charset=x-user-defined");
  req.onload = function () {
    if (this.status === 200) {
      if (req.responseText.match(/^<!doctype html>/i)) {
        // Got HTML back, so it is probably falling back to index.html due to 404
        return callback(new Error("Page not found"));
      }

      callback(null, this.responseText);
    } else if (this.status === 0) {
      // Aborted, so ignore error
    } else {
      callback(new Error(req.statusText));
    }
  };
  req.onerror = function () {
    callback(new Error(req.statusText));
  };
  req.onprogress = handleProgress;
  req.send();
  return req;
}

/*
 * The UI for the emulator. Also responsible for loading ROM from URL or file.
 */
class RunPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      romName: null,
      romData: null,
      running: false,
      paused: false,
      controlsModalOpen: false,
      loading: true,
      loadedPercent: 3,
      error: null
    };
  }

  render() {
    return (
      <div className="RunPage">
        <nav
          className="navbar navbar-expand"
          ref={el => {
            this.navbar = el;
          }}
        >
          <ul className="navbar-nav" style={{ width: "200px" }}>
            <li className="navitem">
              <Link to="/" className="nav-link">
                &lsaquo; Back
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto mr-auto">
            <li className="navitem">
              <span className="navbar-text mr-3">{this.state.romName}</span>
              {/* <canvas width={256 * 2} height={240 * 2} ref={enhance => {
                this.enhance = enhance;


              }} /> */}
            </li>
          </ul>
          <ul className="navbar-nav" style={{ width: "200px" }}>
            <li className="navitem">
              <Button
                outline
                color="primary"
                onClick={this.toggleControlsModal}
                className="mr-3"
              >
                Controls
              </Button>
              <Button
                outline
                color="primary"
                onClick={this.handlePauseResume}
                disabled={!this.state.running}
              >
                {this.state.paused ? "Resume" : "Pause"}
              </Button>
            </li>
          </ul>
        </nav>

        {this.state.error ? (
          this.state.error
        ) : (
            <div
              className="screen-container"
              ref={el => {
                this.screenContainer = el;
              }}
            >
              {this.state.loading ? (
                <Progress
                  value={this.state.loadedPercent}
                  style={{
                    position: "absolute",
                    width: "70%",
                    left: "15%",
                    top: "48%"
                  }}
                />
              ) : this.state.romData ? (
                <Emulator
                  romData={this.state.romData}
                  paused={this.state.paused}
                  ref={emulator => {
                    this.emulator = emulator;
                  }}
                />

              ) : null}
              {/* TODO: lift keyboard and gamepad state up */}
              {this.state.controlsModalOpen && (
                <ControlsModal
                  isOpen={this.state.controlsModalOpen}
                  toggle={this.toggleControlsModal}
                  keys={this.emulator.keyboardController.keys}
                  setKeys={this.emulator.keyboardController.setKeys}
                  promptButton={this.emulator.gamepadController.promptButton}
                  gamepadConfig={this.emulator.gamepadController.gamepadConfig}
                  setGamepadConfig={
                    this.emulator.gamepadController.setGamepadConfig
                  }
                />
              )}
            </div>
          )}
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener("resize", this.layout);
    this.layout();
    this.load();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.layout);
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
  }

  load = () => {
    if (this.props.match.params.slug) {
      const slug = this.props.match.params.slug;
      const isLocalROM = /^local-/.test(slug);
      const romHash = slug.split("-")[1];
      const romInfo = isLocalROM
        ? RomLibrary.getRomInfoByHash(romHash)
        : config.ROMS[slug];

      if (!romInfo) {
        this.setState({ error: `No such ROM: ${slug}` });
        return;
      }

      if (isLocalROM) {
        this.setState({ romName: romInfo.name });
        const localROMData = localStorage.getItem("blob-" + romHash);
        this.handleLoaded(localROMData);
      } else {
        this.setState({ romName: romInfo.description });
        this.currentRequest = loadBinary(
          romInfo.url,
          (err, data) => {
            if (err) {
              this.setState({ error: `Error loading ROM: ${err.message}` });
            } else {
              this.handleLoaded(data);
            }
          },
          this.handleProgress
        );
      }
    } else if (this.props.location.state && this.props.location.state.file) {
      let reader = new FileReader();
      reader.readAsBinaryString(this.props.location.state.file);
      reader.onload = e => {
        this.currentRequest = null;
        this.handleLoaded(reader.result);
      };
    } else {
      this.setState({ error: "No ROM provided" });
    }
  };

  handleProgress = e => {
    if (e.lengthComputable) {
      this.setState({ loadedPercent: (e.loaded / e.total) * 100 });
    }
  };

  handleLoaded = data => {
    this.setState({ running: true, loading: false, romData: data });
    // const scaler = Anime4K.Scaler(this.enhance.getContext('webgl'));
    // let stopped = false;
    // let canvas = this.emulator.screen.canvas;
    // let ctx = canvas.getContext("2d");
    // const loop = () => {
    //   if (stopped) return;
    //   let imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //   scaler.inputImage(imagedata);
    //   scaler.resize(2.0, {});
    //   requestAnimationFrame(loop);
    // };
    // requestAnimationFrame(loop);
  };

  handlePauseResume = () => {
    this.setState({ paused: !this.state.paused });
  };

  layout = () => {
    let navbarHeight = parseFloat(window.getComputedStyle(this.navbar).height);
    this.screenContainer.style.height = `${window.innerHeight -
      navbarHeight}px`;
    if (this.emulator) {
      this.emulator.fitInParent();
    }
  };

  toggleControlsModal = () => {
    this.setState({ controlsModalOpen: !this.state.controlsModalOpen });
  };
}

export default RunPage;
