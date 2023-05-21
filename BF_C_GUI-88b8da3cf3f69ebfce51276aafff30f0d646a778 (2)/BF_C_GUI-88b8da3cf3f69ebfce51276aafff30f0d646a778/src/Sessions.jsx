import React from 'react';
import Page from "./Page.jsx";
import Input from "./Input.jsx";
import Loader from "./Loader.jsx";

class Sessions extends React.Component {
    constructor(props) {
        super(props);
        this.SelectPeriod = this.SelectPeriod.bind(this);
        this.getData = this.getData.bind(this);
        this.search = this.search.bind(this);
        this.Localize = this.Localize.bind(this);
        this.Scroll = this.Scroll.bind(this);
        this.getExport = this.getExport.bind(this);
        this.sendExport = this.sendExport.bind(this);
        this.state = {
            period: 'today',
            dt1: '',
            dt2: '',
            name: '',
            email: '',
            phone: '',
            sessions: [],
            total: 0,
            offset: 0,
            isLoading: false,
            isImporting: false,
            error: '',
            TabHeader: false,
            disableButtons: true,
            lastOpend: null,
        };
    }

    getData(data) {
        console.log(data);
        if (data.type == 'sessions') {
            //let tmp = this.state.sessions;
            //tmp.push(data.response.sessions);
            this.setState({
                sessions: this.state.sessions.concat(data.sessions),
                total: data.total,
                offset: this.state.offset + data.sessions.length,
                isLoading: false
            });
            if (data.sessions.length == 0) {
                this.setState({error: window.loc.sessionsNothingFound});
            }
        }

        if (data.type == 'export') {
            window.export = JSON.parse(JSON.stringify(data.exports[0]));
            window.export.mailList = undefined;
            window.export.stored = true;
            window.search = new Object();
            window.search.period = this.state.period;
            window.search.dt1 = this.state.dt1;
            window.search.dt2 = this.state.dt2;
            window.search.name = this.state.name;
            window.search.email = this.state.email;
            window.search.phone = this.state.phone;
            window.search.sessions = this.state.sessions;
            window.search.total = this.state.total;
            window.search.offset = this.state.offset;
            window.search.lastOpend = this.state.lastOpend;
            window.search.scroll = document.getElementById('Scroll').scrollTop;


            if (window.settings.mode == 'default') this.props.history.push('/MainPage');
            if (window.settings.mode == 'duo') this.props.history.push('/MainPageDuo');

        }
        if (data.result == false) {
            this.setState({
                isLoading: false,
                error: data.errorMsg,
            });

        }
        //this.setState({isLoading: false});
    }

    componentWillUnmount() {
        if (window.testMode == false) {
            window.updater.postQueryFromDB.disconnect(this.getData);
        }
    }

    sendExport() {
        if (window.export !== null && window.export.mailList !== undefined) {
            window.export.datetimeend = Date.now();
            console.log('Send Export to backend: ');
            console.log(window.export);
            let senddata = {'uuid': window.updaterUUID, 'data': JSON.stringify(window.export)};
            if (window.testMode == false) {
                window.updater.saveToDb(senddata);
            }
            window.export = null;
        }
    }

    componentDidMount() {
        window.setTimeout(()=>{this.setState({disableButtons: false})}, 200);
        this.SelectPeriod('today');
        if (window.testMode == false) {
            window.updater.postQueryFromDB.connect(this.getData);
        }
        if (window.search !== null) {
            this.setState({
                period: window.search.period,
                dt1: window.search.dt1,
                dt2: window.search.dt2,
                name: window.search.name,
                email: window.search.email,
                phone: window.search.phone,
                sessions: window.search.sessions,
                total: window.search.total,
                offset: window.search.offset,
                lastOpend: window.search.lastOpend,
            });
            window.setTimeout(()=>{document.getElementById('Scroll').scrollTop = window.search.scroll;},100);
        }
        this.sendExport();
    }

    SelectPeriod(p) {
        this.setState({period: p});
        console.log(p);
        if (p == 'today') {
            this.setState({
                dt1: moment().format('YYYY-MM-DD'),
                dt2: moment().format('YYYY-MM-DD')
            });
        }
        if (p == 'this_week') {
            this.setState({
                dt1: moment().startOf('week').format('YYYY-MM-DD'),
                dt2: moment().endOf('week').format('YYYY-MM-DD')
            });
        }
        if (p == 'this_month') {
            this.setState({
                dt1: moment().startOf('month').format('YYYY-MM-DD'),
                dt2: moment().endOf('month').format('YYYY-MM-DD')
            });
        }
        if (p == 'last_7') {
            this.setState({
                dt1: moment().subtract(6, 'days').format('YYYY-MM-DD'),
                dt2: moment().format('YYYY-MM-DD')
            });
        }
        if (p == 'last_30') {
            this.setState({
                dt1: moment().subtract(29, 'days').format('YYYY-MM-DD'),
                dt2: moment().format('YYYY-MM-DD')
            });
        }

    }

    search(offset) {
        console.log('Get sessions from: '+offset);
        this.setState({isLoading: true, error: ''});
        let data = new Object();
        //data.cmd = 'search';

        let d = moment(this.state.dt1);
        d.set({hour:0,minute:0,second:0,millisecond:0});
        data.dt1 = parseInt(d.format('x'));

        d = moment(this.state.dt2);
        d.add(1, 'days');

        d.set({hour:0,minute:0,second:0,millisecond:0});
        data.dt2 = parseInt(d.format('x'));

        data.name = this.state.name;
        data.email = this.state.email;
        data.phone = this.state.phone;
        data.offset = offset;
        data.mode = window.settings.mode;
        updater.queryToDB(data);
    }

    Localize(t) {
        //let d = moment(t+' +0000', 'YYYY-MM-DD HH:mm:ss Z');
        let d = moment(t);
        return d.format('YYYY-MM-DD HH:mm:ss');
    }

    Scroll() {
        let top = document.getElementById('Scroll').scrollTop;
        let height = document.getElementById('Win').offsetHeight;
        let cont = document.getElementById('Scroll').offsetHeight;
        if ((height - (top + cont) < 100) && !this.state.isLoading && this.state.offset < this.state.total) {
            this.search(this.state.offset);
        }

        //let header = document.getElementById('TabHeader');

        //let hh = document.getElementById('Head').offsetHeight;
        let hh = document.getElementById('Parameters').offsetHeight;
        //console.log(top);
        //258+50
        if (top <= hh) {
            //header.style.top = 258 + 80 - top + 'px';
            this.setState({TabHeader: false});
        } else {
            //header.style.top = '80px';
            this.setState({TabHeader: true});
        }

        //console.log(height - (top + cont));


    }

    getExport(id) {
        console.log('Get export: '+id);
        this.setState({isImporting: true, error: '', lastOpend: id});
        let data = new Object();
        //data.cmd = 'getsession';
        data.id = id;
        updater.queryToDB(data);
    }

    render() {
        let items = [];
        this.state.sessions.map((el, key) => {
            //el.name = 'Sergei Crawford';
            //el.email = 'serebr13@gmail.com';
            //el.phone = '3477406675';
            items.push(<div className={el.id==this.state.lastOpend?'Item HighLight':'Item'} key={el.id} onClick={() => {this.getExport(el.id)}}>
                <div className="Dt">{this.Localize(el.dt)}</div>
                <div className="Client">{el.name}<br/>{el.email}<br/>{el.phone}</div>
                <div className="PNG"><img src={el.preview0} /><img src={el.preview1} /></div>
            </div>);
        });
        return(
            <Page class="Sessions"
                  backButton="/"
                  {...this.props}
            >
                <div className="SessionsCont" onScroll={this.Scroll} id="Scroll">
                    <div className="Sessions" id="Win">
                        <div className="Parameters" id="Parameters">
                            <div className="SForm">
                                <label>{window.loc.sessionsDateRange}</label>
                                <select
                                    onChange={(el) => {this.SelectPeriod(el.target.value)}}
                                    value={this.state.period}
                                    className={'normal'}
                                >
                                    <option value="today">{window.loc.sessionsToday}</option>
                                    <option value="this_week">{window.loc.sessionsThisWeek}</option>
                                    <option value="this_month">{window.loc.sessionsThisMonth}</option>
                                    <option value="last_7">{window.loc.sessionsLast7Days}</option>
                                    <option value="last_30">{window.loc.sessionsLast30Days}</option>
                                    <option value="custom">{window.loc.sessionsCustom}</option>

                                </select>
                                <span></span>
                            </div>
                            <Input
                                value={this.state.dt1}
                                onChange={(v) => {
                                    this.setState({
                                        dt1: v,
                                        period: 'custom'
                                    });
                                }}
                                error=""
                                type="date"
                                className="SForm"
                                label={window.loc.sessionsStartDate}
                            />
                            <Input
                                value={this.state.dt2}
                                onChange={(v) => {
                                    this.setState({
                                        dt2: v,
                                        period: 'custom'
                                    });
                                }}
                                error=""
                                type="date"
                                className="SForm"
                                label={window.loc.sessionsEndDate}
                            />

                            <Input
                                value={this.state.name}
                                onChange={(v) => {
                                    this.setState({
                                        name: v
                                    });
                                }}
                                error=""
                                type="text"
                                className="SForm"
                                label={window.loc.sessionsName}
                                autoCapitalize="words"
                            />
                            <Input
                                value={this.state.email}
                                onChange={(v) => {
                                    this.setState({
                                        email: v
                                    });
                                }}
                                error=""
                                type="email"
                                className="SForm"
                                label={window.loc.sessionsEmail}
                            />
                            <Input
                                value={this.state.phone}
                                onChange={(v) => {
                                    this.setState({
                                        phone: v
                                    });
                                }}
                                error=""
                                type="tel"
                                className="SForm"
                                label={window.loc.sessionsPhone}
                            />
                            <button className="Search"
                                    onClick={() => {
                                        this.setState({
                                            sessions: [],
                                            total: 0,
                                            offset: 0,
                                        });
                                        this.search(0);
                                    }}
                                    disabled={this.state.isLoading}
                                    onTouchStart={() => {}}
                            >
                                {window.loc.sessionsSearchButton}
                            </button>

                        </div>
                        {this.state.sessions.length > 0 &&
                        <div className="TabHeader">
                            <div className="Dt">{window.loc.sessionsDateTimeLabel}</div>
                            <div className="Client">{window.loc.sessionsClientLabel}</div>
                            <div className="PNG">{window.loc.sessionsPressureMapsLabel}</div>
                        </div>
                        }
                        {items}
                        {this.state.isLoading &&
                        <div style={{paddingTop: '2.604vh'}}><Loader/></div>
                        }
                        {!this.state.isLoading && this.state.error != '' && !this.state.isImporting &&
                        <div style={{paddingTop: '2.604vh'}}><span className="Error">{this.state.error}</span></div>
                        }




                    </div>


                </div>
                {this.state.sessions.length > 0 && this.state.TabHeader &&
                <div className="TabHeader" id="TabHeader" style={{position: 'absolute', top: '10vmin'}}>
                    <div className="Dt">{window.loc.sessionsDateTimeLabel}</div>
                    <div className="Client">{window.loc.sessionsClientLabel}</div>
                    <div className="PNG">{window.loc.sessionsPressureMapsLabel}</div>
                </div>
                }
                {this.state.isImporting &&
                <div className="ScanSensorsBack">
                    <div className="ScanSensorsWindow">
                        {this.state.error == '' && <div>
                            <h1 style={{marginBottom: '5.208vh'}}>{window.loc.sessionsOpeningLabel}</h1>
                            <Loader/>
                        </div>}
                        {this.state.error != '' && <div>
                            <h1>{this.state.error}</h1>
                            <button
                                onClick={() => {this.setState({isImporting: false, error: ''})}}
                                onTouchStart={() => {}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                <span>{window.loc.sessionsCloseButton}</span>
                            </button>
                        </div>}
                    </div>
                </div>
                }



            </Page>
        );
    }
}

export default Sessions;