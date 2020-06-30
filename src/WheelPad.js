import React, { Component } from "react";
import { Button } from "reactstrap"
import nipplejs from "nipplejs"
import PropTypes from "prop-types";
import "./WheelPad.css"
class WheelPad extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

    }
    render() {
        return (
            <div
                className="WheelPad"
                ref={container => {
                    this.container = container;
                }}
            >
                <div className="leftgroup"
                    ref={leftgroup => {
                        this.leftgroup = leftgroup;
                    }}>
                </div>
                <div className="rightgroup">
                    <Button className="centerbutton" onTouchStart={e => {

                        this.send("A", true);
                    }} onTouchEnd={e => {

                        this.send("A", false);
                    }}>A</Button>
                    <Button className="centerbutton" onTouchStart={e => {

                        this.send("B", true);
                    }} onTouchEnd={e => {

                        this.send("B", false);
                    }}>B</Button>
                    <Button className="centerbutton" onTouchStart={e => {

                        this.send("SELECT", true);
                    }} onTouchEnd={e => {

                        this.send("SELECT", false);
                    }}>SELECT</Button>
                    <Button className="centerbutton" onTouchStart={e => {

                        this.send("START", true);
                    }} onTouchEnd={e => {

                        this.send("START", false);
                    }}>START</Button>
                </div>
            </div>

        );
    }

    send = (type, value) => {
        switch (type) {
            case "A": window.virtualGamePad.buttons[0].pressed = value; break;
            case "B": window.virtualGamePad.buttons[1].pressed = value; break;
            case "SELECT": window.virtualGamePad.buttons[2].pressed = value; break;
            case "START": window.virtualGamePad.buttons[3].pressed = value; break;
            case "LEFT": window.virtualGamePad.axes[0] = -1; window.virtualGamePad.axes[1] = 0; break;
            case "RIGHT": window.virtualGamePad.axes[0] = 1; window.virtualGamePad.axes[1] = 0; break;
            case "UP": window.virtualGamePad.axes[1] = -1; window.virtualGamePad.axes[0] = 0; break;
            case "DOWN": window.virtualGamePad.axes[1] = 1; window.virtualGamePad.axes[0] = 0; break;
            case "END": window.virtualGamePad.axes[1] = 0; window.virtualGamePad.axes[0] = 0; break;
            default: console.error("unrecognized Type");
        }
        console.log(window.virtualGamePad);

    };

    componentDidMount() {
        this.nipple = nipplejs.create({
            zone: this.leftgroup,
            mode: "static",
            position: { left: '10%', top: '50%' }
        })
        this.nipple.on("dir:up", data => {
            this.send("UP", true);
        })
        this.nipple.on("dir:down", data => {
            this.send("DOWN", true);
        })
        this.nipple.on("dir:left", data => {
            this.send("LEFT", true);
        })
        this.nipple.on("dir:right", data => {
            this.send("RIGHT", true);
        })
        this.nipple.on("end", data => {
            this.send("END", true);
        })
        window.virtualGamePad = {
            id: "virtualGamePad",
            axes: [0, 0],
            buttons: [
                { pressed: false }, { pressed: false }, { pressed: false }, { pressed: false }
            ]
        }
        let gamepadConfig = {
            "configs": {
                "virtualGamePad": {
                    "buttons": [
                        {
                            "code": 0,
                            "type": "axis",
                            "buttonId": 7,
                            "value": 1
                        },
                        {
                            "code": 1,
                            "type": "axis",
                            "buttonId": 4,
                            "value": -1
                        },
                        {
                            "code": 1,
                            "type": "axis",
                            "buttonId": 5,
                            "value": 1
                        },
                        {
                            "code": 1,
                            "type": "button",
                            "buttonId": 0
                        },
                        {
                            "code": 0,
                            "type": "button",
                            "buttonId": 1
                        },
                        {
                            "code": 3,
                            "type": "button",
                            "buttonId": 3
                        },
                        {
                            "code": 2,
                            "type": "button",
                            "buttonId": 2
                        },
                        {
                            "code": 0,
                            "type": "axis",
                            "buttonId": 6,
                            "value": -1
                        }
                    ]
                }
            },
            "playerGamepadId": [
                "virtualGamePad"
            ]
        }
        localStorage.setItem("gamepadConfig", JSON.stringify(gamepadConfig));


    }

    componentWillUnmount() {
        localStorage.removeItem("gamepadConfig");
    }





}
WheelPad.propTypes = {
    buttonEventCallback: PropTypes.func,
};
export default WheelPad;
