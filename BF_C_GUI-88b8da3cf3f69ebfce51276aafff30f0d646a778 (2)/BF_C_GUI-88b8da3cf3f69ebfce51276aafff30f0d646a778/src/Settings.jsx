import React from 'react';
import Page from "./Page.jsx";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.saveSettings = this.saveSettings.bind(this);
        this.cloneObject = this.cloneObject.bind(this);
        this.sendTestEmail = this.sendTestEmail.bind(this);
        this.getPostNotification = this.getPostNotification.bind(this);
        this.scrollDown = this.scrollDown.bind(this);
        this.state = {
            mode: 'default',
            maxCorrection: -20,
            maxCorrection123: -20,
            mattressName: ['Mattress 1', 'Mattress 2', 'Mattress 3', 'Mattress 4'],
            system: 'metric',
            language: 'en',
            emailMode: 'custom',
            emailServer: '',
            emailPort: 0,
            emailUser: '',
            emailPassword: '',
            emailProtocol: 0,
            isTestEmail: false,
            testEmailResult: '',
            isGrid: false,
            isScale: false,
        };
    }

    componentDidMount() {
        this.setState({
            mode: window.settings.mode,
            maxCorrection: window.settings.maxCorrection,
            maxCorrection123: window.settings.maxCorrection123,
            mattressName: this.cloneObject(window.settings.mattressName),
            system: window.settings.system,
            language: window.settings.language,
            emailMode: window.settings.emailMode,
            emailServer: window.settings.emailServer,
            emailPort: window.settings.emailPort,
            emailUser: window.settings.emailUser,
            emailPassword: window.settings.emailPassword,
            emailProtocol: window.settings.emailProtocol,
            isGrid: window.settings.isGrid,
            isScale: window.settings.isScale,
        });
    }

    cloneObject(original) {
        return JSON.parse(JSON.stringify(original));
    }

    saveSettings() {
        window.settings.mode = this.state.mode;
        window.settings.maxCorrection = this.state.maxCorrection;
        window.settings.maxCorrection123 = this.state.maxCorrection123;
        window.settings.mattressName = this.cloneObject(this.state.mattressName);
        window.settings.system = this.state.system;
        window.settings.language = this.state.language;
        window.settings.emailMode = this.state.emailMode;
        window.settings.emailServer = this.state.emailServer;
        window.settings.emailPort = this.state.emailPort;
        window.settings.emailUser = this.state.emailUser;
        window.settings.emailPassword = this.state.emailPassword;
        window.settings.emailProtocol = this.state.emailProtocol;
        window.settings.isGrid = this.state.isGrid;
        window.settings.isScale = this.state.isScale;
        if (window.testMode == false) {
            let settings = this.cloneObject(window.settings);
            window.updater.saveToLDB(JSON.stringify(settings));
        }

        this.props.history.push('/');
    }

    sendTestEmail() {
        this.setState({isTestEmail: true, testEmailResult: ''});
        let email = new Object();
        email.emailOnly = true;
        email.emailfiles = [];
        email.emailsubject = 'Test email';
        email.emailtemplate = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head></head><h1>Test Email</h1><body></body></html>';
        email.mailList = ['test@sensorprod.com'];
        email.customSMTP = {
            host: this.state.emailServer,
            port: this.state.emailPort,
            user: this.state.emailUser,
            password: this.state.emailPassword,
            type: this.state.emailProtocol
        }
        let senddata = {'uuid': window.updaterUUID, 'data': JSON.stringify(email)};
        if (window.testMode == false) {
            window.updater.postNotification.connect(this.getPostNotification);
            window.updater.saveToDb(senddata);
        } else {
            this.setState({isTestEmail: false});
        }

    }

    getPostNotification(returnValue) {
        if (returnValue.type == 'emailProgress') {
            window.updater.postNotification.disconnect(this.getPostNotification);
            if (returnValue.result == 'ok') {
                this.setState({isTestEmail: false, testEmailResult: 'Success'});
            }
            if (returnValue.result == 'error') {
                this.setState({isTestEmail: false, testEmailResult: returnValue.error});
            }
        }
    }

    scrollDown() {
        let h = document.getElementById('ScrollBox').scrollHeight;
        document.getElementById('ScrollBox').scrollTo(0, h);
    }

    render() {
        return(
            <Page class="Settings">
                <div className="ScrollBox" id="ScrollBox">
                    <div className="Mode">
                        <h2>{window.loc.settingsModeTitle}</h2>
                        <label htmlFor="M1">
                            <input className="Radio" name="Mode" type="radio" id="M1"
                                   checked={this.state.mode=='default'}
                                   onChange={(e) => {
                                       this.setState({mode: 'default'});
                                   }}
                            />
                            {window.loc.settingsDefaultMode}
                        </label>
                        <p>{window.loc.settingsDefaultModeDescription}</p>
                        <label htmlFor="M2">
                            <input className="Radio" name="Mode" type="radio" id="M2"
                                   checked={this.state.mode=='duo'}
                                   onChange={(e) => {
                                       this.setState({mode: 'duo'});
                                   }}
                            />
                            {window.loc.settingsDuoMode}
                        </label>
                        <p>{window.loc.settingsDuoModeDescription}</p>
                        <br/>
                        <h2>{window.loc.settingsLanguageTitle}</h2>
                        <label htmlFor="L1">
                            <input className="Radio" name="Language" type="radio" id="L1"
                                   checked={this.state.language=='en'}
                                   onChange={(e) => {
                                       this.setState({language: 'en'});
                                   }}
                            />
                            English
                        </label><br/>
                        <label htmlFor="L2">
                            <input className="Radio" name="Language" type="radio" id="L2"
                                   checked={this.state.language=='ru'}
                                   onChange={(e) => {
                                       this.setState({language: 'ru'});
                                   }}
                            />
                            Russian (Русский)
                        </label><br/>
                        <label htmlFor="L3">
                            <input className="Radio" name="Language" type="radio" id="L3"
                                   checked={this.state.language=='es'}
                                   onChange={(e) => {
                                       this.setState({language: 'es'});
                                   }}
                            />
                            Spanish (Española)
                        </label><br/>
                        <label htmlFor="L4">
                            <input className="Radio" name="Language" type="radio" id="L4"
                                   checked={this.state.language=='de'}
                                   onChange={(e) => {
                                       this.setState({language: 'de'});
                                   }}
                            />
                            German (Deutsch)
                        </label>

                        <h2>Email</h2>
                        <label htmlFor="EM1">
                            <input className="Radio" name="EmailMode" type="radio" id="EM1"
                                   checked={this.state.emailMode=='default'}
                                   onChange={(e) => {
                                       this.setState({emailMode: 'default'});
                                   }}
                            />
                            {window.loc.emailDefaultMode}
                        </label><br/>
                        <label htmlFor="EM2">
                            <input className="Radio" name="EmailMode" type="radio" id="EM2"
                                   checked={this.state.emailMode=='custom'}
                                   onChange={(e) => {
                                       this.setState({emailMode: 'custom'}, this.scrollDown);
                                   }}
                            />
                            {window.loc.emailCustomMode}
                        </label>
                        {this.state.emailMode == 'custom' &&
                            <div className="EmailSettings">
                                <h2>{window.loc.emailCustomTitle}</h2>
                                <div className="ServerPort">
                                    <div className="Item">
                                        <label>{window.loc.emailServer}</label>
                                        <input type="text" style={{width: '100%'}}
                                               value={this.state.emailServer}
                                               onChange={(e) => {
                                                   this.setState({emailServer: e.target.value});
                                               }}
                                               disabled={this.state.isTestEmail}
                                               autoCapitalize={"none"}
                                               autoComplete="off"
                                               autoCorrect="off"
                                               spellCheck="false"
                                        />
                                    </div>
                                    <div className="Item">
                                        <label>{window.loc.emailPort}</label>
                                        <input type="number" style={{width: '100%'}}
                                               value={this.state.emailPort}
                                               min={0}
                                               max={65535}
                                               step={1}
                                               onChange={(e) => {
                                                   this.setState({emailPort: e.target.value});
                                               }}
                                               disabled={this.state.isTestEmail}
                                               autoCapitalize={"none"}
                                               autoComplete="off"
                                               autoCorrect="off"
                                               spellCheck="false"
                                        />
                                    </div>

                                </div>
                                <div className="Item">
                                    <label>{window.loc.emailUser}</label>
                                    <input type="text" style={{width: '100%'}}
                                           value={this.state.emailUser}
                                           onChange={(e) => {
                                               this.setState({emailUser: e.target.value});
                                           }}
                                           disabled={this.state.isTestEmail}
                                           autoCapitalize={"none"}
                                           autoComplete="off"
                                           autoCorrect="off"
                                           spellCheck="false"
                                    />
                                </div>
                                <div className="Item">
                                    <label>{window.loc.emailPassword}</label>
                                    <input type="password" style={{width: '100%'}}
                                           value={this.state.emailPassword}
                                           onChange={(e) => {
                                               this.setState({emailPassword: e.target.value});
                                           }}
                                           disabled={this.state.isTestEmail}
                                           autoCapitalize={"none"}
                                           autoComplete="off"
                                           autoCorrect="off"
                                           spellCheck="false"
                                    />
                                </div>

                                <label>{window.loc.emailProtocol}</label>
                                <div className="Protocol">
                                    <label htmlFor="EP1">
                                        <input className="Radio" name="EmailProtocol" type="radio" id="EP1"
                                               checked={this.state.emailProtocol==0}
                                               onChange={(e) => {
                                                   this.setState({emailProtocol: 0});
                                               }}
                                               disabled={this.state.isTestEmail}
                                        />
                                        TCP
                                    </label>
                                    <label htmlFor="EP2">
                                        <input className="Radio" name="EmailProtocol" type="radio" id="EP2"
                                               checked={this.state.emailProtocol==1}
                                               onChange={(e) => {
                                                   this.setState({emailProtocol: 1});
                                               }}
                                               disabled={this.state.isTestEmail}
                                        />
                                        SSL
                                    </label>
                                    <label htmlFor="EP3">
                                        <input className="Radio" name="EmailProtocol" type="radio" id="EP3"
                                               checked={this.state.emailProtocol==2}
                                               onChange={(e) => {
                                                   this.setState({emailProtocol: 2});
                                               }}
                                               disabled={this.state.isTestEmail}
                                        />
                                        TLS
                                    </label>
                                </div>
                                <div className="TestEmail">
                                    <button
                                        disabled={this.state.isTestEmail}
                                        onClick={this.sendTestEmail}
                                    >
                                        {window.loc.emailTryToConnect}
                                    </button>
                                    <label>{this.state.testEmailResult}</label>
                                </div>

                            </div>}


                    </div>
                    <div className="Options">
                        <h2>{window.loc.settingsOptionsTitle}</h2>
                        <div className="Item">
                            <input type="number" min={-100} max={100} step={1}
                                   value={this.state.maxCorrection}
                                   onChange={(e) => {
                                       this.setState({maxCorrection: e.target.value});
                                   }}
                                   style={{verticalAlign: 'middle'}}
                            />
                            <label>{window.loc.settingsMaxCorrectionFirst}</label>
                        </div>
                        <div className="Item">
                            <input type="number" min={-100} max={100} step={1}
                                   value={this.state.maxCorrection123}
                                   onChange={(e) => {
                                       this.setState({maxCorrection123: e.target.value});
                                   }}
                                   style={{verticalAlign: 'middle'}}
                            />
                            <label>{window.loc.settingsMaxCorrectionOther}</label>
                        </div>
                        <label htmlFor="Op1" style={{marginRight: 30}}>
                            <input className="Checkbox" type="checkbox" id="Op1"
                                   checked={this.state.isGrid}
                                   onChange={(e) => {
                                       this.setState({isGrid: e.target.checked});
                                   }}
                            />
                            {window.loc.pressureMapGrid}
                        </label>
                        <label htmlFor="Op2" style={{marginRight: 30}}>
                            <input className="Checkbox" type="checkbox" id="Op2"
                                   checked={this.state.isScale}
                                   onChange={(e) => {
                                       this.setState({isScale: e.target.checked});
                                   }}
                            />
                            {window.loc.colorbarScale}
                        </label>


                        <h2>{window.loc.settingsUnitSystemTitle}</h2>
                        <label htmlFor="S1" style={{marginRight: 30}}>
                            <input className="Radio" name="System" type="radio" id="S1"
                                   checked={this.state.system=='metric'}
                                   onChange={(e) => {
                                       this.setState({system: 'metric'});
                                   }}
                            />
                            {window.loc.settingsMetric}
                        </label>
                        <label htmlFor="S2">
                            <input className="Radio" name="System" type="radio" id="S2"
                                   checked={this.state.system=='imperial'}
                                   onChange={(e) => {
                                       this.setState({system: 'imperial'});
                                   }}
                            />
                            {window.loc.settingsImperial}
                        </label>



                        <h2>{window.loc.settingsDefMattNameTitle}</h2>
                        <div className="Item">
                            <label>{window.loc.settingsMattress} 1</label>
                            <input type="text" style={{width: '100%'}}
                                   value={this.state.mattressName[0]}
                                   onChange={(e) => {
                                       let m = this.state.mattressName;
                                       m[0] = e.target.value;
                                       this.setState({mattressName: m});
                                   }}
                            />
                        </div>
                        <div className="Item">
                            <label>{window.loc.settingsMattress} 2</label>
                            <input type="text" style={{width: '100%'}}
                                   value={this.state.mattressName[1]}
                                   onChange={(e) => {
                                       let m = this.state.mattressName;
                                       m[1] = e.target.value;
                                       this.setState({mattressName: m});
                                   }}
                            />
                        </div>
                        {this.state.mode=='default' && <>
                        <div className="Item">
                            <label>{window.loc.settingsMattress} 3</label>
                            <input type="text" style={{width: '100%'}}
                                   value={this.state.mattressName[2]}
                                   onChange={(e) => {
                                       let m = this.state.mattressName;
                                       m[2] = e.target.value;
                                       this.setState({mattressName: m});
                                   }}
                            />
                        </div>
                        <div className="Item">
                            <label>{window.loc.settingsMattress} 4</label>
                            <input type="text" style={{width: '100%'}}
                                   value={this.state.mattressName[3]}
                                   onChange={(e) => {
                                       let m = this.state.mattressName;
                                       m[3] = e.target.value;
                                       this.setState({mattressName: m});
                                   }}
                            />
                        </div>
                        </>}
                    </div>
                </div>




                <div className="Buttons">
                    <button
                        className="White"
                        onClick={() => {
                            this.props.history.push('/');
                        }}
                    >
                        {window.loc.settingsCancelButton}
                    </button>
                    <button
                        className="White"
                        onClick={this.saveSettings}
                    >
                        {window.loc.settingsSaveButton}
                    </button>
                </div>

            </Page>
        );
    }
}

export default Settings;