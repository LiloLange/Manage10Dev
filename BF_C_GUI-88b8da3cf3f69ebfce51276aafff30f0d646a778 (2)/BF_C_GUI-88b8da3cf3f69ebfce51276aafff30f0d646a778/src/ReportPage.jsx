import React from 'react';
import Page from "./Page.jsx";
import Score from './Score.jsx';
import Input from "./Input.jsx";
import {getMassCenter, Smoothing, Normalize, getMaximums, getVectors, getStats, getMaximumsShoulder, isInside} from './Calculation.jsx';
import Loader from "./Loader.jsx";

class ReportPage extends React.Component {
    constructor(props) {
        super(props);
        this.calculateScore = this.calculateScore.bind(this);
        this.ValidateEmail = this.ValidateEmail.bind(this);
        this.sendMail = this.sendMail.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.cloneObject = this.cloneObject.bind(this);
        this.calculateNew = this.calculateNew.bind(this);
        this.createEmailTemplate =this.createEmailTemplate.bind(this);
        this.createPreview = this.createPreview.bind(this);
        this.getPostNotification = this.getPostNotification.bind(this);
        this.maxScore = 100;
        this.bestScore = 0;
        this.state = {
            isEmail: 0,
            email: '',
            errorEmail: '',
            disableButtons: true,
            newFormulaRes: null,
        };
    }

    calculateScore() {
        if (window.export !== null) {
            window.export.scores = [];
            let max = 0;
            let press = [];
            let maxPress = 0;
            let minPress = null;
            let countMatt = 0;
            for (let i = 0; i < 4; i++) {
                if (window.export.sensors[i].side !== null || window.export.sensors[i].back !== null) {
                    countMatt++;
                    if (window.export.sensors[i].side !== null && window.export.sensors[i].back !== null) {
                        press[i] = parseFloat(window.export.sensors[i].side.sensorSpecific.statistics.averagePressure.value) * 0.8 + parseFloat(window.export.sensors[i].back.sensorSpecific.statistics.averagePressure.value) * 0.2;
                    } else {
                        if (window.export.sensors[i].side !== null) press[i] = parseFloat(window.export.sensors[i].side.sensorSpecific.statistics.averagePressure.value);
                        if (window.export.sensors[i].back !== null) press[i] = parseFloat(window.export.sensors[i].back.sensorSpecific.statistics.averagePressure.value);
                    }

                    if (press[i] > maxPress) {maxPress = press[i]}
                    if (minPress === null) {minPress = press[i]}
                    if (press[i] < minPress) {minPress = press[i]}
                }
            }



            let Shift = 0;
            if (window.export.demoMode) {
                Shift = (maxPress - minPress) / 5;
            } else {
                Shift = (maxPress - minPress) / (3 + (10 * Math.random()));
            }

            if (window.export.Shift !== undefined) {Shift = window.export.Shift}
            window.export.Shift = Shift;

            minPress = minPress - Shift;
            maxPress = maxPress + Shift;

            let K = ((maxPress) - (minPress)) / 75; //50
            if (countMatt == 2) {
                K = ((maxPress) - (minPress)) / 15; //10
            }

            //console.log('K: '+K);


            for (let i = 0; i < 4; i++) {
                if (window.export.sensors[i].side !== null || window.export.sensors[i].back !== null) {
                    window.export.scores[i] = Math.round(90 - ((press[i] - minPress) / K));
                    if (window.export.scores[i] > max) {
                        max = window.export.scores[i];
                        this.bestScore = i;
                    }
                } else {
                    window.export.scores[i] = 0;
                }
            }
            this.maxScore = max;
            //console.log(window.export.scores);
        }
    }

    calculateNew() {
        let maxPressure = parseFloat(window.export.sensors[0].back.sensorSpecific.statistics.averagePressure.value);
        let minPressure = parseFloat(window.export.sensors[0].back.sensorSpecific.statistics.averagePressure.value);
        let Imin = 0;
        let Imax = 0;


        for (let i = 0; i < 4; i++) {
            if (window.export.sensors[i].back !== null) {
                if (maxPressure < parseFloat(window.export.sensors[i].back.sensorSpecific.statistics.averagePressure.value)) {
                    maxPressure = parseFloat(window.export.sensors[i].back.sensorSpecific.statistics.averagePressure.value);
                    Imax = i;
                }
                if (minPressure > parseFloat(window.export.sensors[i].back.sensorSpecific.statistics.averagePressure.value)) {
                    minPressure = parseFloat(window.export.sensors[i].back.sensorSpecific.statistics.averagePressure.value);
                    Imin = i;
                }
            }
        }
        let minArea = parseFloat(window.export.sensors[Imin].back.sensorSpecific.statistics.surfaceArea.value);
        let maxArea = parseFloat(window.export.sensors[Imax].back.sensorSpecific.statistics.surfaceArea.value);

        let PrPressure = 100 * (maxPressure - minPressure) / maxPressure;
        let PrArea = 100 * (maxArea - minArea) / maxArea;


        //Calculate L of higher PSI mattress

        let L = 0;

        let massCenter = getMassCenter(window.export.sensors[Imax].back.readings, window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
        if (massCenter.r === null || massCenter.c === null) {
            L = 0;
        } else {
            let nReadings = Smoothing(window.export.sensors[Imax].back.readings, window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
            nReadings = Smoothing(nReadings, window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
            nReadings = Smoothing(nReadings, window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
            nReadings = Normalize(nReadings);
            let maximums = getMaximums(nReadings, massCenter, window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
            let vectors = getVectors(nReadings, maximums[0], window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);

            let maxShoulders = getMaximumsShoulder(nReadings, massCenter, window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
            let statS = null;
            if (isInside(maxShoulders[0], vectors) == false) {
                let vectorsS = getVectors(nReadings, maxShoulders[0], window.export.sensors[Imax].back.sensorSpecific.rows, window.export.sensors[Imax].back.sensorSpecific.columns);
                statS = getStats(vectorsS);
            }
            let stat = getStats(vectors);
            if (statS !== null) {
                stat.L_ave = (stat.L_ave + statS.L_ave) / 2;
                stat.L_sum = stat.L_sum + statS.L_sum;
            }

            L = stat.L_ave;
        }

        let R = (PrPressure / PrArea) / L;

        let res = '<table><tr><td>Highest PSI mattress</td><td>'+(Imax+1)+'</td></tr>';
        res += '<tr><td>Lowest PSI mattress</td><td>'+(Imin+1)+'</td></tr>';
        res += '<tr><td>#1. Change PSI, %</td><td>'+PrPressure.toFixed(4)+'</td></tr>';
        res += '<tr><td>#2. Change Surface Area, %</td><td>'+PrArea.toFixed(4)+'</td></tr>';
        res += '<tr><td>#3. = #1/#2</td><td>'+(PrPressure / PrArea).toFixed(4)+'</td></tr>';
        res += '<tr><td>L of highest PSI mattress</td><td>'+L.toFixed(4)+'</td></tr>';
        res += '<tr><td>Result = #3/L</td><td>'+R.toFixed(4)+'</td></tr>';
        res += '</table>';
        this.setState({newFormulaRes: res});
    }

    cloneObject(original) {
        return JSON.parse(JSON.stringify(original));
    }

    componentWillMount() {
        if (window.export === null) {
            window.export = this.cloneObject(window.demo);
        }

        this.calculateScore();
        this.createEmailTemplate();
        this.createPreview();
        //this.calculateNew();

        //window.export.scores[3] = 13;
        //window.export.sensors[3] = window.export.sensors[0];

    }

    getPosition(elem){

        let dims = {offsetLeft:0, offsetTop:0};

        do {
            dims.offsetLeft += elem.offsetLeft;
            dims.offsetTop += elem.offsetTop;
        }

        while (elem = elem.offsetParent);

        return dims;
    }

    ValidateEmail(mail) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
            return (true);
        } else {
            return (false);
        }
    }

    getPostNotification(returnValue) {
        if (returnValue.type == 'emailProgress') {
            window.updater.postNotification.disconnect(this.getPostNotification);
            if (returnValue.result == 'ok') {
                this.setState({isEmail: 2});
            }
            if (returnValue.result == 'error') {
                this.setState({isEmail: 1, errorEmail: returnValue.error});
            }
            window.export.emailOnly = false;
        }
    }

    sendMail() {
        if (this.ValidateEmail(this.state.email)) {
            let mailList = [];
            if (window.export.mailList !== undefined) {
                mailList = window.export.mailList
            }
            let isListed = false;
            for (let i = 0; i < mailList.length; i++) {
                if (mailList[i] == this.state.email) {
                    isListed = true
                }
            }
            //Remove previous emails;
            isListed = false;
            mailList = [];
            if (isListed == false) {
                mailList.push(this.state.email);
                window.export.mailList = mailList;
                //send right now;
                window.export.emailOnly = true;
                window.export.datetimeend = Date.now();
                console.log('Send Export to backend: ');
                console.log(window.export);
                let senddata = {'uuid': window.updaterUUID, 'data': JSON.stringify(window.export)};
                if (window.testMode == false) {
                    window.updater.postNotification.connect(this.getPostNotification);
                    window.updater.saveToDb(senddata);
                }
            }
            this.setState({isEmail: 3});
        } else {
            this.setState({errorEmail: window.loc.mainEmailIncorrect});
        }
    }

    createEmailTemplate() {
        let body = document.getElementById('template_match').innerText;

        body = body.replace('{{tplHello}}', window.loc.tplHello);
        body = body.replace('{{tplTitle}}', window.loc.tplTitle);
        body = body.replace('{{tplBack}}', window.loc.tplBack);
        body = body.replace('{{tplSide}}', window.loc.tplSide);
        body = body.replace(new RegExp('{{tplAvgPressure}}', 'g'), window.loc.mainAvgPressure);
        body = body.replace(new RegExp('{{tplSurfaceArea}}', 'g'), window.loc.mainSurfaceArea);
        body = body.replace(new RegExp('{{tplOverpressureArea}}', 'g'), window.loc.mainOverpressureArea);



        let name = window.loc.tplName;
        if (window.export.profile !== undefined && window.export.profile.name != '') { name = window.export.profile.name;}
        body = body.replace('%name%', name);
        //body = body.replace('%firmness%', this.state.firmness);
        if (window.brand == 'MM') {
            body = body.replace(new RegExp('%logo%', 'g'), 'mm.png');
        }
        if (window.brand == 'BF') {
            body = body.replace(new RegExp('%logo%', 'g'), 'bf.png');
        }
        if (window.brand == 'PU') {
            body = body.replace(new RegExp('%logo%', 'g'), 'pu.png');
        }
        if (window.brand == 'VI') {
            body = body.replace(new RegExp('%logo%', 'g'), 'vi.png');
            body = body.replace('{{address}}', `<table style="max-width: 600px; width: 100%; background-color: #282A2D" align="center" cellpadding="5" cellspacing="0" border="0">
                  <tr>
                    <td valign="bottom">
                      <p style="color: #ffffff; padding: 0; font-size: 12px">
                      <a href="https://www.viasono.com.uy/" style="color: #ffffff; text-decoration: none; font-size: 12px">www.viasono.com.uy</a>
                      </p>
                    </td>
                    <td valign="bottom">
                      <p style="color: #ffffff; padding: 0; font-size: 12px">
                      Montevideo<br/>
                      Rbla. República del Perú 809<br/>
                      Av. Italia 6190<br/>
                      27110050
                      </p>
                    </td>
                    <td valign="bottom">
                      <p style="color: #ffffff; padding: 0; font-size: 12px">
                      Punta del este<br/>
                      Av. Italia 20100
                      </p>
                    </td>
                  </tr>
                </table>`);
        } else {
            body = body.replace('{{address}}', '');
        }

        body = body.replace('{{MattressName}}', window.export.mattressName[this.bestScore]);

        if (window.export.sensors[this.bestScore].back !== null) {
            body = body.replace(new RegExp('%left_begin%', 'g'), '');
            body = body.replace(new RegExp('%left_end%', 'g'), '');
            body = body.replace('{{ap1}}', Number.parseFloat(window.export.sensors[this.bestScore].back.sensorSpecific.statistics.averagePressure.value).toFixed(1));
            body = body.replace('{{sa1}}', Number.parseFloat(window.export.sensors[this.bestScore].back.sensorSpecific.statistics.surfaceArea.value).toFixed(0));
            body = body.replace('{{oa1}}', Number.parseFloat(window.export.sensors[this.bestScore].back.sensorSpecific.statistics.excessivePressureArea.value).toFixed(0));
        } else {
            body = body.replace(new RegExp('%left_begin%', 'g'), '<!--');
            body = body.replace(new RegExp('%left_end%', 'g'), '-->');
        }

        if (window.export.sensors[this.bestScore].side !== null) {
            body = body.replace(new RegExp('%right_begin%', 'g'), '');
            body = body.replace(new RegExp('%right_end%', 'g'), '');
            body = body.replace('{{ap2}}', Number.parseFloat(window.export.sensors[this.bestScore].side.sensorSpecific.statistics.averagePressure.value).toFixed(1));
            body = body.replace('{{sa2}}', Number.parseFloat(window.export.sensors[this.bestScore].side.sensorSpecific.statistics.surfaceArea.value).toFixed(0));
            body = body.replace('{{oa2}}', Number.parseFloat(window.export.sensors[this.bestScore].side.sensorSpecific.statistics.excessivePressureArea.value).toFixed(0));
        } else {
            body = body.replace(new RegExp('%right_begin%', 'g'), '<!--');
            body = body.replace(new RegExp('%right_end%', 'g'), '-->');
        }




        //body = body.replace('{{title1}}', window.export.mattressName[0]);
        //body = body.replace('{{title2}}', window.export.mattressName[1]);

        body = body.replace(new RegExp('{{unit1}}', 'g'), window.settings.system=='metric'?window.loc.unitGCM2:window.loc.unitPSI);
        body = body.replace(new RegExp('{{unit2}}', 'g'), window.settings.system=='metric'?window.loc.unitCM2:window.loc.unitIN2);
        body = body.replace(/src="/g, 'src="cid:');

        //let ctx = document.getElementById('circle').can getContext('2d');

        let cnv = document.createElement('canvas');
        cnv.width = 200;
        cnv.height = 200;
        let ctx = cnv.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);

        ctx.beginPath();
        ctx.arc(100, 100, 95, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#FE922F';
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'lighter 100px "Helvetica", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#ffffff';
        ctx.fillText(window.export.scores[this.bestScore],100,130);

        cnv.remove();



        let strMime = "image/png";
        let circleData = cnv.toDataURL(strMime);

        //console.log(imgData);


        //console.log(body);
        window.export.emailtemplate = body;
        window.export.emailsubject = window.loc.tplSubject1;
        window.export.emailfiles = [
            {name: 'ap.jpg', type: 'static'},
            //{name: 'icon_facebook.png', type: 'static'},
            //{name: 'icon_linkedin.png', type: 'static'},
            //{name: 'logo.png', type: 'static'},
            {name: 'mp.jpg', type: 'static'},
            {name: 'sa.jpg', type: 'static'},
            {name: 'circle.png', type: 'generated', data: circleData}
        ];

        if (window.brand == 'MM') {
            window.export.emailfiles.push({name: 'mm.png', type: 'static'});
        }
        if (window.brand == 'BF') {
            window.export.emailfiles.push({name: 'bf.png', type: 'static'});
        }
        if (window.brand == 'VI') {
            window.export.emailfiles.push({name: 'vi.png', type: 'static'});
        }
        if (window.brand == 'PU') {
            window.export.emailfiles.push({name: 'pu.png', type: 'static'});
        }

        if (window.export.sensors[this.bestScore].back !== null) {
            window.export.emailfiles.push({name: 'map1.png', type: 'generated', data: window.export.sensors[this.bestScore].backPNG});
        }
        if (window.export.sensors[this.bestScore].side !== null) {
            window.export.emailfiles.push({name: 'map2.png', type: 'generated', data: window.export.sensors[this.bestScore].sidePNG});
        }




    }

    createPreview() {
        //window.export.sensors[this.bestScore].backPNG;
        //window.export.sensors[this.bestScore].sidePNG;
        let cnv = document.createElement('canvas');
        let ctx = cnv.getContext("2d");
        let image = new Image();
        image.src = window.export.sensors[this.bestScore].backPNG;
        image.onload = () => {
            cnv.width = 140;
            cnv.height = Math.round(image.width * 140 / image.height);
            ctx.rotate(-90 * Math.PI / 180);
            //ctx.translate(0, -cnv.width);
            ctx.translate(-cnv.height, 0);
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, cnv.height, cnv.width);
            window.export.preview0 = cnv.toDataURL("image/png");
            cnv.remove();
            image.remove();
        };
        let cnv2 = document.createElement('canvas');
        let ctx2 = cnv2.getContext("2d");
        let image2 = new Image();
        image2.src = window.export.sensors[this.bestScore].sidePNG;
        image2.onload = () => {
            cnv2.width = 140;
            cnv2.height = Math.round(image2.width * 140 / image2.height);
            ctx2.rotate(-90 * Math.PI / 180);
            //ctx.translate(0, -cnv.width);
            ctx2.translate(-cnv2.height, 0);
            ctx2.drawImage(image2, 0, 0, image2.width, image2.height, 0, 0, cnv2.height, cnv2.width);
            window.export.preview1 = cnv2.toDataURL("image/png");
            cnv2.remove();
            image2.remove();
        };
    }

    render() {
        let Scores = [];
        for (let i=0; i<4; i++) {
            if (window.export.scores[i] !== undefined && window.export.scores[i] !== 0) {
                Scores.push(
                    <Score
                        sensor={window.export.sensors[i]}
                        mattressName={window.export.mattressName[i]}
                        score={window.export.scores[i]}
                        isMax={this.maxScore == window.export.scores[i]?true:false}
                        key={i}
                    />
                );
            }
        }


        return (
            <Page
                backButton="/MainPage"
                {...this.props}
            >
                <div className="Scores">
                    {Scores}
                </div>
                <div className="Controls">
                    <button className="ButtonPlay Orange" style={{width: '150px', marginTop: 'calc(6vmin - 21px)'}}
                            onClick={() => {
                                this.props.history.push('/');
                            }}
                            onTouchStart={() => {}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            <path d="M0 0h24v24H0z" fill="none"/>
                        </svg>
                        <span>{window.loc.reportDoneButton}</span>
                    </button>

                    <button className="ButtonPlay Green" style={{width: '150px', marginTop: 'calc(6vmin - 21px)'}}
                            onClick={() => {
                                this.setState({isEmail: 1});
                                if (this.state.email == '' && window.export !== null && window.export.profile !== undefined && window.export.profile.email != '') {
                                    this.setState({
                                        email: window.export.profile.email,
                                        errorEmail: '',
                                    });

                                }
                            }}
                            onTouchStart={() => {}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fillOpacity=".9" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                            <path fill="none" d="M0 0h24v24H0z"/>
                        </svg>
                        <span>{window.loc.reportEmailButton}</span>
                    </button>

                    <button className="ButtonPlay Blue" style={{minWidth: '150px', marginTop: 'calc(6vmin - 21px)'}}
                            onClick={(e) => {


                                let pos = this.getPosition(e.currentTarget);

                                let senddata = {
                                    'x': pos.offsetLeft.toString(),
                                    'y': pos.offsetTop.toString(),
                                    'width': e.currentTarget.clientWidth.toString(),
                                    'height': e.currentTarget.clientHeight.toString()
                                };
                                console.log(senddata);
                                window.core.printScreenRect(senddata);

                            }}
                            onTouchStart={() => {}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                            <path d="M0 0h24v24H0z" fill="none"/>
                        </svg>
                        <span>{window.loc.reportPrintButton}</span>
                    </button>


                    <button
                        className="calculateNew"
                        onClick={this.calculateNew}
                        style={{display: 'none'}}
                    >i
                    </button>

                </div>
                {this.state.newFormulaRes !== null &&
                    <div className="hiddenStat"
                         dangerouslySetInnerHTML={{__html: this.state.newFormulaRes}}
                    >

                    </div>
                }
                {this.state.isEmail > 0 &&
                <div className="SendEmail">
                    <div className="SendEmailWindow">
                        {this.state.isEmail == 1 &&
                        <div>
                            <h1>{window.loc.mainEmailTitle}</h1>
                            <form onSubmit={(event) => {this.sendMail(); event.preventDefault();}} action="#">
                                <Input
                                    value={this.state.email}
                                    onChange={(v) => {this.setState({email: v, errorEmail: ''})}}
                                    width={'90%'}
                                    error={this.state.errorEmail}
                                />
                                <input type="submit" style={{display: 'none'}} />
                            </form>

                            <button
                                onClick={() => {this.setState({isEmail: 0})}}
                                className="Orange"
                                onTouchStart={() => {}}
                            >
                                <span>{window.loc.mainEmailCancelButton}</span>
                            </button>
                            <button
                                onClick={() => {this.sendMail()}}
                                className="Green"
                                disabled={this.ValidateEmail(this.state.email) == false}
                                onTouchStart={() => {}}
                            >
                                <span>{window.loc.mainEmailSendButton}</span>
                            </button>
                        </div>
                        }
                        {this.state.isEmail == 2 &&
                        <div>
                            <h1>{window.loc.mainEmailResultTitle}</h1>
                            <div style={{height: 90}}></div>
                            <button
                                onClick={() => {this.setState({isEmail: 0})}}
                                className="Green"
                                onTouchStart={() => {}}
                            >
                                <span>{window.loc.mainEmailCloseButton}</span>
                            </button>
                        </div>
                        }
                        {this.state.isEmail == 3 &&
                        <div>
                            <h1 style={{marginBottom: '5.208vh'}}>{window.loc.mainPleaseWaitLabel}</h1>
                            <Loader/>
                        </div>
                        }
                    </div>
                </div>
                }
            </Page>
        );
    }
}

export default ReportPage;