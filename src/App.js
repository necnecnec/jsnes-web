import React, { Component } from "react";
import GoogleAnalytics from "react-ga";
import { HashRouter, Route } from "react-router-dom";
import ListPage from "./ListPage";
import RunPage from "./RunPage";
import MobRunPage from "./MobRunPage";
import WheelPad from "./WheelPad"
import config from "./config";
import { handleError } from "./utils";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    if (config.GOOGLE_ANALYTICS_CODE) {
      GoogleAnalytics.initialize(config.GOOGLE_ANALYTICS_CODE);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container my-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              Oops - there has been an error. It has been logged to the console.
            </div>
          </div>
        </div>
      );
    }
    return (
      <HashRouter>
        <div className="App">
          <Route exact path="/" component={ListPage} />
          <Route exact path="/run" component={RunPage} />
          <Route exact path="/run/:slug" component={RunPage} />
          <Route exact path="/mobrun/:slug" component={MobRunPage} />
          <Route exact path="/test" component={WheelPad} />
          <Route path="/" render={this.recordPageview} />
        </div>
      </HashRouter>
    );
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    handleError(error, errorInfo);
  }

  recordPageview = ({ location }) => {
    GoogleAnalytics.pageview(location.pathname);
    return null;
  };
}

export default App;
