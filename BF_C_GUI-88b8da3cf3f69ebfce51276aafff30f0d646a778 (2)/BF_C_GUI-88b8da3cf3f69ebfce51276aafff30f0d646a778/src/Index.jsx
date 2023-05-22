import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, HashRouter, Route, Link, Switch, hashHistory } from 'react-router-dom';
import { AnimatedSwitch } from 'react-router-transition';

// import ErrorBaundary from './ErrorBoundary.jsx';
import Page404 from './Page404.jsx';
import MainPage from './MainPage.jsx';
import StartPage from './StartPage.jsx';
import Profile from './Profile.jsx';
import ReportPage from './ReportPage.jsx';
import UpdatePage from './UpdatePage.jsx';
import Settings from "./Settings.jsx";
import MainPageDuo from "./MainPageDuo.jsx";
import Sessions from "./Sessions.jsx";

ReactDOM.render(
        <Router>
            <HashRouter>
                <AnimatedSwitch
                    atEnter={{ opacity: 0 }}
                    atLeave={{ opacity: 0 }}
                    atActive={{ opacity: 1 }}
                    className="switch-wrapper"
                >
                    <Route exact path="/" component={StartPage}/>
                    <Route path="/Profile" component={Profile}/>
                    <Route path="/MainPage" component={MainPage}/>
                    <Route path="/MainPageDuo" component={MainPageDuo}/>
                    <Route path="/ReportPage" component={ReportPage}/>
                    <Route path="/UpdatePage" component={UpdatePage}/>
                    <Route path="/Settings" component={Settings}/>
                    <Route path="/Sessions" component={Sessions}/>
                    <Route component={Page404}/>
                </AnimatedSwitch>
            </HashRouter>
        </Router>,
    document.getElementById("root")
);