import React from 'react';
import Loader from "./Loader.jsx";

let started = false;

class StartPage extends React.Component {
    constructor(props) {
        super(props);
        this.sendExport = this.sendExport.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.cloneObject = this.cloneObject.bind(this);
        this.setLanguage = this.setLanguage.bind(this);
        this.state = {
            status: '',
            isStarted: false,
            disableButtons: true,
        };
    }

    updateInfo(returnValue) {
        console.log(returnValue);
        if (returnValue.type == 'updateCore' || returnValue.type == 'updateGUI' || returnValue.type == 'activation') {
            window.update = returnValue.type;
            this.props.history.push('/UpdatePage');
        }
    }

    componentWillUnmount() {
        if (window.testMode == false) {
            window.updater.postNotification.disconnect(this.updateInfo);
        }
    }

    sendExport() {
        if (window.export !== null) {
            window.export.datetimeend = Date.now();
            window.export.emailOnly = false;
            console.log('Send Export to backend: ');
            console.log(window.export);
            let senddata = {'uuid': window.updaterUUID, 'data': JSON.stringify(window.export)};
            if (window.testMode == false) {
                window.updater.saveToDb(senddata);
            }
            window.export = null;
        }
    }

    cloneObject(original) {
        return JSON.parse(JSON.stringify(original));
    }

    setLanguage() {
        if (window.settings.language == 'ru') {
            window.loc = window.ru;
        } else if (window.settings.language == 'es') {
            window.loc = window.es;
        } else if (window.settings.language == 'de') {
            window.loc = window.de;
        } else {
            window.loc = window.en;
        }
        this.forceUpdate();
    }

    getSettings() {
        window.updater.postValueFromLDB.connect((returnValue) => {
            if (returnValue != '') {
                let settings = JSON.parse(returnValue);
                if (settings.emailMode === undefined) {
                    settings.emailMode = 'default';
                    settings.emailServer = '';
                    settings.emailPort = 0;
                    settings.emailUser = '';
                    settings.emailPassword = '';
                    settings.emailProtocol = 0;
                }
                if (settings.isGrid === undefined) settings.isGrid = false;
                if (settings.isScale === undefined) settings.isScale = false;
                window.settings = this.cloneObject(settings);
                this.setLanguage();
            }
            if (window.settings.mode == 'duo') {
                window.core.setOrientation('portrait');
            } else {
                window.core.setOrientation('all');
            }

        });
        window.updater.getFromLDB();
    }


    componentDidMount() {
        this.setLanguage();
        this.setState({status: ''});
        if (window.testMode == false) {
            window.updater.postNotification.connect(this.updateInfo);

            if (started == false) {
                window.updater.receiveLogin(window.login);
                let senddata = {'uuid': window.updaterUUID, 'state': '1'};
                window.updater.receiveCurrentState(senddata);
                started = true;
            }
            let senddata = {'uuid': window.updaterUUID, 'state': '2'};
            window.updater.receiveCurrentState(senddata);
            this.getSettings();

        }
        this.sendExport();
    }


    render() {
        return(
            <div className="StartPage">
                <div>
                    <button
                        className="SettingsButton"
                        onClick={() => {
                            this.props.history.push('/Settings');
                        }}
                        onTouchStart={() => {}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="none" d="M0 0h20v20H0V0z"/><path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                    </button>
                    <button
                        className="SettingsButton"
                        style={{right: 80}}
                        onClick={() => {
                            window.search = null;
                            this.props.history.push('/Sessions');
                        }}
                        onTouchStart={() => {}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
                    </button>

                    {window.brand == 'BF' &&
                    <img src="img/BodyfitterLogo.png" className="LogoBF"/>
                    }
                    {window.brand == 'MM' &&
                    <img src="img/MundoMattress.png" className="LogoMM"/>
                    }
                    {window.brand == 'VI' &&
                        <img src="img/viasono_big.svg" className="LogoVI"/>
                    }
                    {window.brand == 'PU' &&
                        <img src="img/Puritas.svg" className="LogoPU"/>
                    }


                    <br/>
                    {this.state.isStarted == false &&
                    <button className="TapToStart"
                            onClick={() => {
                                this.setState({isStarted: true});
                                let senddata = {'uuid': window.updaterUUID, 'state': '3'};
                                if (window.testMode == false) {
                                    window.updater.receiveCurrentState(senddata);
                                }
                                window.export = null;
                                window.search = null;
                                window.setTimeout(()=>{this.props.history.push('/Profile');}, 100);

                            }}
                            onTouchStart={() => {}}
                    >
                        <span>{window.loc.tapToStartButton}</span>
                    </button>
                    }
                    {this.state.isStarted == true &&
                        <div style={{marginTop: 40, marginBottom: 40, height: 45}}>
                            <Loader/>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default StartPage;