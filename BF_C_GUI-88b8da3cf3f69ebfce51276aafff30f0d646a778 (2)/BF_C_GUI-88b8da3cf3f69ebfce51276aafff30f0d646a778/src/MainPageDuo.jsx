import React, {useState, useEffect, useRef} from "react";

import Mattress from "./Mattress.jsx";
import PositionToggle from "./PositionToggle.jsx";
import Page from "./Page.jsx";
import Pager from "./Pager.jsx";
import Loader from "./Loader.jsx";
import Input from './Input.jsx';
import html2canvas from 'html2canvas';

import * as animateScroll from "./AnimateScroll.jsx";
import Colorbar from "./Colorbar.jsx";




class MainPageDuo extends React.Component {
    constructor(props) {
        super(props);

        this.onChangePosition = this.onChangePosition.bind(this);
        this.onChangeMattressName = this.onChangeMattressName.bind(this);
        this.onActivateMattress = this.onActivateMattress.bind(this);
        this.setOrientation = this.setOrientation.bind(this);
        this.onScrollMattress = this.onScrollMattress.bind(this);
        this.onEndScroll = this.onEndScroll.bind(this);
        this.loadFromExport = this.loadFromExport.bind(this);
        this.cloneObject = this.cloneObject.bind(this);
        this.createDefSetting = this.createDefSetting.bind(this);
        this.sortRule = this.sortRule.bind(this);
        this.genColorMapFromSettings = this.genColorMapFromSettings.bind(this);
        this.calculateSettings = this.calculateSettings.bind(this);
        this.onChangePosition = this.onChangePosition.bind(this);
        this.onPlayStop = this.onPlayStop.bind(this);
        this.onChangeSensor = this.onChangeSensor.bind(this);
        this.onChangeMattress = this.onChangeMattress.bind(this);
        this.onGetData = this.onGetData.bind(this);
        this.toExport = this.toExport.bind(this);
        this.getListOfSensors = this.getListOfSensors.bind(this);
        this.scanSensors = this.scanSensors.bind(this);
        this.scrollFromJS = this.scrollFromJS.bind(this);
        this.getAveragePressureReduction = this.getAveragePressureReduction.bind(this);
        this.sendMail = this.sendMail.bind(this);
        this.ValidateEmail = this.ValidateEmail.bind(this);
        this.createEmailTemplate = this.createEmailTemplate.bind(this);
        this.createPreview = this.createPreview.bind(this);
        this.getPostNotification = this.getPostNotification.bind(this);
        this.getSurfaceReduction = this.getSurfaceReduction.bind(this);
        this.setDevNewSettings = this.setDevNewSettings.bind(this);
        this.setMinMax = this.setMinMax.bind(this);

        this.defSettings = new Object();
        this.defColormap = {color: []};
        this.ColorMaps = [{side: null, back: null}, {side: null, back: null}, {side: null, back: null}, {side: null, back: null}];
        this.Settings = [{side: new Object(), back: new Object()},{side: new Object(), back: new Object()},{side: new Object(), back: new Object()},{side: new Object(), back: new Object()}];
        this.storeSensors = [{side: null, back: null},{side: null, back: null},{side: null, back: null},{side: null, back: null}];

        this.timer = null;
        this.lastSensor = null;
        this.needUpdate = true;
        this.brightnessSide = 0;
        this.brightnessBack = 0;
        this.contrastSide = 0;
        this.contrastBack = 0;
        this.brightnessSide123 = 0;
        this.brightnessBack123 = 0;
        this.contrastSide123 = 0;
        this.contrastBack123 = 0;

        this.averagePressure0 = 0;
        this.surfaceArea0 = 0;





        this.state = {
            position: 'back',
            mattressName: ['Mattress 1', 'Mattress 2', 'Mattress 3', 'Mattress 4'],
            demoMode: false,
            stepMode: 1,
            portraitViewRotation: 0,
            mattressActivated: 2,
            portrait: true,
            play: false,
            sensors: [],
            isScanSensors: 0,
            curSensor: 0,
            maxCorrection: -30,
            selectedMattress: 0,
            averagePressureReduction: 0,
            isEmail: 0,
            email: '',
            errorEmail: '',
            devPanel: false,
            min: 0,
            max: 2,

        };
    }

    setMinMax(sensor) {
        console.log('setMinMax:');
        console.log(sensor);
        let min = sensor.sensorSpecific.minimum_real;
        let max = sensor.sensorSpecific.maximum_real;
        let unit = sensor.sensorSpecific.units;
        let needUnits = window.settings.system=='imperial'?'psi':'g/cm²';
        if (unit != needUnits) {
            if (needUnits == 'g/cm²') {
                min *= 70.306958;
                max *= 70.306958;
            } else {
                min *= 0.0142233;
                max *= 0.0142233;
            }
        }
        this.setState({
            min: min,
            max: max
        });
    }

    loadFromExport() {
        console.log('Load From Export');
        //console.log(window.demo);
        //window.export = this.cloneObject(window.demo);

        //this.Mattress0.hideMap();
        //this.Mattress1.hideMap();
        //this.Mattress2.hideMap();
        //this.Mattress3.hideMap();

        this.setState({
            demoMode: true,
            mattressName: window.export.mattressName,
            position: 'back',
            mattressActivated: window.export.mattressActivated,
        });
        this.Settings = window.export.Settings;
        this.storeSensors = window.export.sensors;
        //this.ColorMaps = window.export.ColorMaps;
        for (let i=0; i<4; i++) {
            this.ColorMaps[i].side = this.genColorMapFromSettings(this.Settings[i].side);
            this.ColorMaps[i].back = this.genColorMapFromSettings(this.Settings[i].back);
        }

        {/*


        this.Mattress0.setColorMap(this.ColorMaps[0].side);
        this.Mattress1.setColorMap(this.ColorMaps[1].side);
        this.Mattress2.setColorMap(this.ColorMaps[2].side);
        this.Mattress3.setColorMap(this.ColorMaps[3].side);


        if (this.storeSensors[0].side !== null) this.Mattress0.renderMap(this.storeSensors[0].side);
        if (this.storeSensors[1].side !== null) this.Mattress1.renderMap(this.storeSensors[1].side);
        if (this.storeSensors[2].side !== null) this.Mattress2.renderMap(this.storeSensors[2].side);
        if (this.storeSensors[3].side !== null) this.Mattress3.renderMap(this.storeSensors[3].side);


        if (this.storeSensors[0].side !== null) this.Mattress0.renderMap(this.storeSensors[0].side);
        if (this.storeSensors[1].side !== null) this.Mattress1.renderMap(this.storeSensors[1].side);
        if (this.storeSensors[2].side !== null) this.Mattress2.renderMap(this.storeSensors[2].side);
        if (this.storeSensors[3].side !== null) this.Mattress3.renderMap(this.storeSensors[3].side);

        this.storeSensors[0].sidePNG = this.Mattress0.renderToPNG();
        this.storeSensors[1].sidePNG = this.Mattress1.renderToPNG();
        this.storeSensors[2].sidePNG = this.Mattress2.renderToPNG();
        this.storeSensors[3].sidePNG = this.Mattress3.renderToPNG();


        this.Mattress0.clearMap();
        this.Mattress1.clearMap();
        this.Mattress2.clearMap();
        this.Mattress3.clearMap();

        */}

        this.Mattress0.setColorMap(this.ColorMaps[0].back);
        this.Mattress1.setColorMap(this.ColorMaps[1].back);
        this.Mattress2.setColorMap(this.ColorMaps[2].back);
        this.Mattress3.setColorMap(this.ColorMaps[3].back);



        if (this.storeSensors[0].back !== null) this.Mattress0.renderMap(this.storeSensors[0].back);
        if (this.storeSensors[1].back !== null) this.Mattress1.renderMap(this.storeSensors[1].back);
        if (this.storeSensors[2].back !== null) this.Mattress2.renderMap(this.storeSensors[2].back);
        if (this.storeSensors[3].back !== null) this.Mattress3.renderMap(this.storeSensors[3].back);

        if (this.storeSensors[0].back !== null) this.Mattress0.renderMap(this.storeSensors[0].back);
        if (this.storeSensors[1].back !== null) this.Mattress1.renderMap(this.storeSensors[1].back);
        if (this.storeSensors[2].back !== null) this.Mattress2.renderMap(this.storeSensors[2].back);
        if (this.storeSensors[3].back !== null) this.Mattress3.renderMap(this.storeSensors[3].back);

        this.storeSensors[0].backPNG = this.Mattress0.renderToPNG();
        this.storeSensors[1].backPNG = this.Mattress1.renderToPNG();
        this.storeSensors[2].backPNG = this.Mattress2.renderToPNG();
        this.storeSensors[3].backPNG = this.Mattress3.renderToPNG();

        if (this.storeSensors[0].back !== null) this.Mattress0.setStatistic(this.storeSensors[0].back);
        if (this.storeSensors[1].back !== null) this.Mattress1.setStatistic(this.storeSensors[1].back);
        if (this.storeSensors[2].back !== null) this.Mattress2.setStatistic(this.storeSensors[2].back);
        if (this.storeSensors[3].back !== null) this.Mattress3.setStatistic(this.storeSensors[3].back);

        this.setMinMax(this.storeSensors[0].back);


        this.averagePressure0 = this.storeSensors[0].back.sensorSpecific.statistics.averagePressure.value;
        this.surfaceArea0 = this.storeSensors[0].back.sensorSpecific.statistics.surfaceArea.value;



        /*
        this.setState({
            averagePressureReduction: this.getAveragePressureReduction(this.averagePressure0, this.storeSensors[1].back.sensorSpecific.statistics.averagePressure.value, this.surfaceArea0, this.storeSensors[1].back.sensorSpecific.statistics.surfaceArea.value)
        });
        */

        this.setState({
            averagePressureReduction: this.getSurfaceReduction(this.surfaceArea0, this.storeSensors[1].back.sensorSpecific.statistics.surfaceArea.value)
        });




        if (this.storeSensors[0].back !== null) this.Mattress0.updateDigits(this.storeSensors[0].back);
        if (this.storeSensors[1].back !== null) this.Mattress1.updateDigits(this.storeSensors[1].back);
        if (this.storeSensors[2].back !== null) this.Mattress2.updateDigits(this.storeSensors[2].back);
        if (this.storeSensors[3].back !== null) this.Mattress3.updateDigits(this.storeSensors[3].back);

        this.setState({isScanSensors: 0});

        this.Mattress0.showMap();
        this.Mattress1.showMap();
        this.Mattress2.showMap();
        this.Mattress3.showMap();



        /*
        let json = require('./demo.json');
        console.log(json);
        this.setState({
            demoMode: true,
            mattressName: json.mattressName,
            pillowName: json.pillowName
        });
        this.Settings = json.Settings;
        this.storeSensors = json.storeSensors;
        this.ColorMaps = json.ColorMaps;
        window.setTimeout(() => {this.onChangePosition();}, 500); //to Side
        window.setTimeout(() => {this.onChangePosition();}, 600); //to Bask
        window.setTimeout(() => {this.onChangePosition();}, 700); //to Side
        window.setTimeout(() => {
            //this.storeSensors[0].sidePNG = this.Mattress0.renderToPNG();
            //this.storeSensors[1].sidePNG = this.Mattress1.renderToPNG();
            this.storeSensors[2].sidePNG = this.Mattress2.renderToPNG();
            //this.storeSensors[3].sidePNG = this.Mattress3.renderToPNG();
        }, 800);
        window.setTimeout(() => {this.onChangePosition();}, 900); //to Back
        window.setTimeout(() => {
            //this.storeSensors[0].backPNG = this.Mattress0.renderToPNG();
            //this.storeSensors[1].backPNG = this.Mattress1.renderToPNG();
            this.storeSensors[2].backPNG = this.Mattress2.renderToPNG();
            //this.storeSensors[3].backPNG = this.Mattress3.renderToPNG();
        }, 1000);
        */

    }

    cloneObject(original) {
        return JSON.parse(JSON.stringify(original));
    }

    createDefSetting(Settings) {
        //Settings.center = -42;
        //Settings.distribution = -166;
        Settings.center = 0;
        Settings.distribution = 0;
        Settings.min = 0;
        Settings.max = 100;
        Settings.gradient = true;
        Settings.colorTable = [];
        /*
        for (let i=1; i<=10; i++) {
            let color = defColor(i/10);
            Settings.colorTable[i-1] = [i*10, color[0], color[1], color[2], 255];
        }
        */

        /*
        Settings.colorTable[0] = [4, 38, 37, 104, 255];
        Settings.colorTable[1] = [7, 56, 81, 159, 255];
        Settings.colorTable[2] = [10, 64, 112, 179, 255];
        Settings.colorTable[3] = [11, 72, 141, 204, 255];
        Settings.colorTable[4] = [13, 69, 182, 232, 255];
        Settings.colorTable[5] = [14, 90, 195, 231, 255];
        Settings.colorTable[6] = [18, 110, 191, 161, 255];
        Settings.colorTable[7] = [23, 144, 195, 64, 255];
        Settings.colorTable[8] = [34, 184, 210, 55, 255];
        Settings.colorTable[9] = [40, 245, 234, 44, 255];
        Settings.colorTable[10] = [63, 251, 219, 33, 255];
        Settings.colorTable[11] = [80, 247, 168, 36, 255];
        Settings.colorTable[12] = [90, 240, 134, 33, 255];
        Settings.colorTable[13] = [95, 233, 86, 32, 255];
        Settings.colorTable[14] = [97, 229, 32, 32, 255];
        Settings.colorTable[15] = [100, 222, 0, 0, 255];
        */

        /*
        Settings.colorTable[0] = [10, 38, 37, 104, 255];
        Settings.colorTable[1] = [20, 0, 141, 202, 255];
        Settings.colorTable[2] = [30, 0, 202, 141, 255];
        Settings.colorTable[3] = [40, 222, 236, 24, 255];
        Settings.colorTable[4] = [50, 235, 240, 3, 255];
        Settings.colorTable[5] = [60, 255, 113, 0, 255];
        Settings.colorTable[6] = [70, 241, 92, 32, 255];
        Settings.colorTable[7] = [80, 250, 13, 17, 255];
        Settings.colorTable[8] = [90, 217, 0, 0, 255];
        Settings.colorTable[9] = [100, 217, 0, 0, 255];
        [15, 69, 182, 232, 255],
        */

        //Settings.colorTable = [[5,0,18,208,255],[10, 69, 182, 232, 255],[25,110,191,161,255],[35,21,188,36,255],[60,246,254,0,255],[80,255,187,0,255],[100,222,0,0,255]];
        //Settings.colorTable = [[4,38,37,104,255],[7,56,81,159,255],[10,64,112,179,255],[11,72,141,204,255],[13,69,182,232,255],[14,90,195,231,255],[18,110,191,161,255],[23,144,195,64,255],[34,184,210,55,255],[45,237,243,23,255],[63,251,219,33,255],[82,247,168,36,255],[90,240,134,33,255],[95,233,86,32,255],[97,229,32,32,255],[100,222,0,0,255]];

        Settings.colorTable = [
            [3,0,0,130],
            [6,0,0,153],
            [9,0,0,181],
            [12,0,0,202],
            [15,0,0,224],
            [18,0,32,241],
            [21,0,66,254],
            [24,0,95,255],
            [27,0,128,255],
            [30,0,144,255],
            [33,0,160,255],
            [36,0,175,255],
            [39,0,193,255],
            [42,0,207,255],
            [45,0,226,255],
            [48,0,240,223],
            [51,0,255,194],
            [54,65,255,128],
            [57,129,255,64],
            [60,162,255,33],
            [63,194,255,0],
            [66,223,255,0],
            [69,255,255,0],
            [72,255,239,0],
            [75,255,223,0],
            [78,255,200,0],
            [81,255,175,0],
            [84,255,160,0],
            [87,255,145,0],
            [90,255,121,0],
            [93,255,96,0],
            [96,255,48,0],
            [100,255,0,0]
        ];


        Settings.alphaTable = Array ([0, 0], [2, 0], [4, 255], [100, 255]);
    }

    sortRule(a, b) {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
    }

    genColorMapFromSettings(settings) {
        let colormap = new Object();
        colormap.color = [];

        function gradient(c1, c2, ratio) {
            return Math.round(c1 * (1-ratio) + c2 * ratio);
        }
        let colorArr = this.cloneObject(settings.colorTable);
        colorArr.sort(this.sortRule);
        if (settings.distribution!=0) {
            let kDistr = 1 + (settings.distribution / 200);
            for (let i = 0; i < colorArr.length; i++) {
                colorArr[i][0] = ((colorArr[i][0] - 50) * kDistr) + 50;
            }
        }
        if (settings.center!=0) {
            for (let i = 0; i < colorArr.length; i++) {
                colorArr[i][0] += settings.center;
            }
        }
        if (colorArr[0][0]>0) {
            colorArr.push([0, colorArr[0][1], colorArr[0][2], colorArr[0][3]]);
            colorArr.sort(this.sortRule);
        }
        if (colorArr[colorArr.length-1][0]<100) {
            colorArr.push([100, colorArr[colorArr.length-1][1], colorArr[colorArr.length-1][2], colorArr[colorArr.length-1][3]]);
            colorArr.sort(this.sortRule);
        }

        //console.log(colorArr);

        for (let i = 1; i < colorArr.length; i++) {
            let ind0 = Math.round(colorArr[i-1][0]*65535/100)+1;
            let ind1 = Math.round(colorArr[i][0]*65535/100);
            if (colorArr[i-1][0]==0) ind0 = 0;
            let indMin = Math.round(settings.min*65535/100);
            let indMax = Math.round(settings.max*65535/100);
            for (let k = ind0; k <= ind1; k++) {
                if (k <= indMin) {
                    colormap.color[k] = [colorArr[0][1], colorArr[0][2], colorArr[0][3], colorArr[0][4]];
                } else {
                    if (k > indMax) {
                        colormap.color[k] = [colorArr[colorArr.length - 1][1], colorArr[colorArr.length - 1][2], colorArr[colorArr.length - 1][3], colorArr[colorArr.length - 1][4]];
                    } else {
                        if (settings.gradient == false) {
                            colormap.color[k] = [colorArr[i][1], colorArr[i][2], colorArr[i][3], colorArr[i][4]];
                        } else {
                            let ratio = (k - ind0) / (ind1 - ind0);
                            let cR = gradient(colorArr[i - 1][1], colorArr[i][1], ratio);
                            let cG = gradient(colorArr[i - 1][2], colorArr[i][2], ratio);
                            let cB = gradient(colorArr[i - 1][3], colorArr[i][3], ratio);
                            let cA = gradient(colorArr[i - 1][4], colorArr[i][4], ratio);
                            colormap.color[k] = [cR, cG, cB, cA];
                        }
                    }
                }
            }

        }



        for (let i = 1; i < settings.alphaTable.length; i++) {
            let ind0 = Math.round(settings.alphaTable[i-1][0]*65535/100)+1;
            let ind1 = Math.round(settings.alphaTable[i][0]*65535/100);
            if (settings.alphaTable[i-1][0]==0) ind0 = 0;
            for (let k = ind0; k <= ind1; k++) {
                let ratio = (k - ind0) / (ind1 - ind0);
                colormap.color[k][3] = gradient(settings.alphaTable[i - 1][1], settings.alphaTable[i][1], ratio);
            }
        }

        if (settings.min > 0) {
            let indMin = Math.round(settings.min*65535/100);
            for (let i = 0; i <= indMin; i++) {
                colormap.color[i][3] = 0;
            }
        }
        if (settings.max < 100) {
            let indMax = Math.round(settings.max*65535/100);
            for (let i = indMax; i <= 65535; i++) {
                colormap.color[i][3] = 0;
            }
        }

        let new2Dcolor  = new Uint8Array( 4 * 65536);
        for (let i=0; i < 65536; i++) {
            let stride = i * 4;
            new2Dcolor[ stride ] = colormap.color[i][0];
            new2Dcolor[ stride + 1 ] = colormap.color[i][1];
            new2Dcolor[ stride + 2 ] = colormap.color[i][2];
            new2Dcolor[ stride + 3 ] = colormap.color[i][3];
        }
        return new THREE.DataTexture( new2Dcolor, 256, 256, THREE.RGBAFormat );
    }

    calculateSettings(data) {
        let min = data.sensorSpecific.statistics.extremumValues.minimum;
        let max = data.sensorSpecific.statistics.extremumValues.maximum;
        let max123 = data.sensorSpecific.statistics.extremumValues.maximum;
        if (max != 0 && max > min) {
            if (window.settings.maxCorrection != 0 || window.settings.maxCorrection123 != 0) {
                max = Math.round(max + max * window.settings.maxCorrection / 100);
                if (max < 0) max = 0;
                if (max <= min) max = min + 1;
                if (max > 65535) max = 65535;

                max123 = Math.round(max123 + max123 * window.settings.maxCorrection123 / 100);
                if (max123 < 0) max123 = 0;
                if (max123 <= min) max123 = min + 1;
                if (max123 > 65535) max123 = 65535;
            }


            let con = Math.round(((65535 - (max - min)) * -199) / 65535);
            let br = Math.round((((((max - min) / 2) + min) - (65535 / 2)) * 100) / 65535);

            let con123 = Math.round(((65535 - (max123 - min)) * -199) / 65535);
            let br123 = Math.round((((((max123 - min) / 2) + min) - (65535 / 2)) * 100) / 65535);


            if (this.state.position == 'back') {
                this.brightnessBack = br;
                this.contrastBack = con;
                this.brightnessBack123 = br123;
                this.contrastBack123 = con123;
                this.Settings[0].back.center = br;
                this.Settings[0].back.distribution = con;
                this.ColorMaps[0].back = this.genColorMapFromSettings(this.Settings[0].back);
                this.Mattress0.setColorMap(this.ColorMaps[0].back);

            } else {
                this.brightnessSide = br;
                this.contrastSide = con;
                this.brightnessSide123 = br123;
                this.contrastSide123 = con123;
                this.Settings[0].side.center = br;
                this.Settings[0].side.distribution = con;
                this.ColorMaps[0].side = this.genColorMapFromSettings(this.Settings[0].side);
                this.Mattress0.setColorMap(this.ColorMaps[0].side);
            }
        }
    }

    onChangePosition() {
        console.log('Change Position');
        let needPlay = false;
        let position = this.state.position;
        let sensor = null;
        if (this.state.play) {
            needPlay = true;
            this.onPlayStop();
        }
        if (position == 'side') {position = 'back';} else {position = 'side';}
        this.setState({position: position});
        window.setTimeout(()=>{
            for (let i=0; i<4; i++) {
                if (position=='side') {sensor = this.storeSensors[i].side;} else {sensor = this.storeSensors[i].back;}
                if (sensor === null) {
                    if (i==0) this.Mattress0.clearMap();
                    if (i==1) this.Mattress1.clearMap();
                    if (i==2) this.Mattress2.clearMap();
                    if (i==3) this.Mattress3.clearMap();
                } else {
                    if (i==0) this.Mattress0.setColorMap(position=='back'?this.ColorMaps[0].back:this.ColorMaps[0].side);
                    if (i==0) this.Mattress1.setColorMap(position=='back'?this.ColorMaps[1].back:this.ColorMaps[1].side);
                    if (i==0) this.Mattress2.setColorMap(position=='back'?this.ColorMaps[2].back:this.ColorMaps[2].side);
                    if (i==0) this.Mattress3.setColorMap(position=='back'?this.ColorMaps[3].back:this.ColorMaps[3].side);

                    if (i==0) this.Mattress0.renderMap(sensor);
                    if (i==1) this.Mattress1.renderMap(sensor);
                    if (i==2) this.Mattress2.renderMap(sensor);
                    if (i==3) this.Mattress3.renderMap(sensor);

                    if (i==0) this.Mattress0.setStatistic(sensor);
                    if (i==1) this.Mattress1.setStatistic(sensor);
                    if (i==2) this.Mattress2.setStatistic(sensor);
                    if (i==3) this.Mattress3.setStatistic(sensor);

                    if (i==0) this.Mattress0.updateDigits(sensor);
                    if (i==1) this.Mattress1.updateDigits(sensor);
                    if (i==2) this.Mattress2.updateDigits(sensor);
                    if (i==3) this.Mattress3.updateDigits(sensor);
                }
            }
        }, 100);

        if (needPlay) {
            window.setTimeout(()=>{this.onPlayStop();}, 200);
        }
    }

    onPlayStop() {
        console.log('Play/Stop');
        if (this.state.play == false) {
            let sensor = this.cloneObject(this.state.sensors[this.state.curSensor]);
            sensor.sensorScan.isOn = true;
            sensor.sensorSpecific.statistics.averagePressure.isOn = true;
            sensor.sensorSpecific.statistics.averagePressure.units = window.settings.system=='metric'?'g/cm²':'psi';

            sensor.sensorSpecific.statistics.excessivePressureArea.isOn = true;
            sensor.sensorSpecific.statistics.excessivePressureArea.treshold = 70;
            sensor.sensorSpecific.statistics.excessivePressureArea.units = window.settings.system=='metric'?'cm²':'in²';

            sensor.sensorSpecific.conversion.isOn = true;
            sensor.sensorSpecific.conversion.unitsTo = window.settings.system=='metric'?'g/cm²':'psi';

            sensor.sensorSpecific.statistics.surfaceArea.isOn = true;
            sensor.sensorSpecific.statistics.surfaceArea.units = window.settings.system=='metric'?'cm²':'in²';

            sensor.sensorSpecific.statistics.overPressureArea.isOn = true;
            sensor.sensorSpecific.statistics.overPressureArea.units = window.settings.system=='metric'?'g/cm²':'psi';

            sensor.sensorSpecific.statistics.stdDeviation.isOn = true;

            sensor.sensorSpecific.smoother.value = 0.7;
            sensor.sensorSpecific.smoother.isOn = true;
            sensor.sensorSpecific.smoother.treshold = 0.02;

            if (sensor.sensorSpecific.tempData !== undefined) {
                sensor.sensorSpecific.tempData.units = window.settings.system=='metric'?'C':'F';
            }

            if (this.state.selectedMattress==0) {
                sensor.sensorSpecific.isobar.brightness = 0;
                sensor.sensorSpecific.isobar.contrast = 0;
                sensor.sensorSpecific.statistics.extremumValues.isOn = true;
            } else {
                sensor.sensorSpecific.isobar.brightness = this.state.position=='side'?this.brightnessSide123:this.brightnessBack123;
                sensor.sensorSpecific.isobar.contrast = this.state.position=='side'?this.contrastSide123:this.contrastBack123;
                sensor.sensorSpecific.statistics.extremumValues.isOn = false;
                if (this.state.position=='side') {
                    this.Settings[this.state.selectedMattress].side.center = this.brightnessSide123;
                    this.Settings[this.state.selectedMattress].side.distribution = this.contrastSide123;
                    this.ColorMaps[this.state.selectedMattress].side = this.genColorMapFromSettings(this.Settings[this.state.selectedMattress].side);
                    this['Mattress'+this.state.selectedMattress].setColorMap(this.ColorMaps[this.state.selectedMattress].side);
                } else {
                    this.Settings[this.state.selectedMattress].back.center = this.brightnessBack123;
                    this.Settings[this.state.selectedMattress].back.distribution = this.contrastBack123;
                    this.ColorMaps[this.state.selectedMattress].back = this.genColorMapFromSettings(this.Settings[this.state.selectedMattress].back);
                    this['Mattress'+this.state.selectedMattress].setColorMap(this.ColorMaps[this.state.selectedMattress].back);
                }
            }

            window.core.setScanSettings(sensor);
            this.setState({play: true});
        } else {
            let sensor = this.cloneObject(this.state.sensors[this.state.curSensor]);
            sensor.sensorScan.isOn = false;
            window.core.setScanSettings(sensor);
            this.setState({play: false});
            if (this.lastSensor !== null) {
                if (this.state.position=='side') {
                    this.storeSensors[this.state.selectedMattress].side = this.cloneObject(this.lastSensor);
                    if (this.state.selectedMattress==0) {this.storeSensors[this.state.selectedMattress].sidePNG = this.Mattress0.renderToPNG()}
                    if (this.state.selectedMattress==1) {this.storeSensors[this.state.selectedMattress].sidePNG = this.Mattress1.renderToPNG()}
                    if (this.state.selectedMattress==2) {this.storeSensors[this.state.selectedMattress].sidePNG = this.Mattress2.renderToPNG()}
                    if (this.state.selectedMattress==3) {this.storeSensors[this.state.selectedMattress].sidePNG = this.Mattress3.renderToPNG()}
                } else {
                    this.storeSensors[this.state.selectedMattress].back = this.cloneObject(this.lastSensor);
                    if (this.state.selectedMattress==0) {this.storeSensors[this.state.selectedMattress].backPNG = this.Mattress0.renderToPNG()}
                    if (this.state.selectedMattress==1) {this.storeSensors[this.state.selectedMattress].backPNG = this.Mattress1.renderToPNG()}
                    if (this.state.selectedMattress==2) {this.storeSensors[this.state.selectedMattress].backPNG = this.Mattress2.renderToPNG()}
                    if (this.state.selectedMattress==3) {this.storeSensors[this.state.selectedMattress].backPNG = this.Mattress3.renderToPNG()}
                }
            }
            if (this.state.position=='side') {
                window.setTimeout(()=>{this.onChangePosition();}, 100);
            }

        }
    }

    onChangeSensor(id) {
        console.log('Change Sensor: '+id);
        if (id=='refresh') {
            if (this.state.play == true) {this.onPlayStop();}
            this.scanSensors();
        } else {
            let needPlay = false;
            if (this.state.play == true) {
                this.onPlayStop();
                needPlay = true;
            }
            this.setState({curSensor: id});
            this.setMinMax(this.state.sensors[id]);
            if (needPlay) {
                window.setTimeout(()=>{this.onPlayStop();}, 200);
            }
        }
    }

    onChangeMattress(id) {
        //console.log('Change Mattress: '+id);
        if (this.state.play==false) {
            this.setState({selectedMattress: id});
        }
        {/*
        for (let i=0; i<4; i++) {
            if (i != id && i == 0) {this.Mattress0.hideZoom()}
            if (i != id && i == 1) {this.Mattress1.hideZoom()}
            if (i != id && i == 2) {this.Mattress2.hideZoom()}
            if (i != id && i == 3) {this.Mattress3.hideZoom()}
        }
        */}
    }

    getListOfSensors(value) {
        console.log(value);
        window.core.postListOfAllSensors.disconnect(this.getListOfSensors);
        let sensors = [];
        value.sensorsAvailable.map((el, key) => {
            if (el.sensorType == 'matrixSensor') {
                sensors.push(el);
            }
        });
        if (sensors.length == 0) {
            this.setState({isScanSensors: 2});
        } else {
            this.setState({isScanSensors: 0, sensors: sensors});
            this.Mattress0.showMap();
            this.Mattress1.showMap();
            this.Mattress2.showMap();
            this.Mattress3.showMap();
            this.setMinMax(sensors[0]);
        }
    }

    scanSensors() {
        console.log('Start Scan Sensors');
        if (this.state.play == true) {this.onPlayStop();}
        this.setState({
            sensors: [],
            isScanSensors: 1,
            curSensor: 0,
        });
        window.core.postListOfAllSensors.connect(this.getListOfSensors);
        window.core.getFullSensorList();


    }

    componentWillMount() {
        //window.testMode = false;
        window.addEventListener('resize', this.setOrientation,false);
        this.setOrientation();
        this.createDefSetting(this.defSettings);
        this.genColorMapFromSettings(this.defSettings, this.defColormap);
        for (let i=0; i<4; i++) {
            window.setTimeout(()=>{
                this.createDefSetting(this.Settings[i].side);
                this.createDefSetting(this.Settings[i].back);
                this.ColorMaps[i].side = this.genColorMapFromSettings(this.Settings[i].side);
                this.ColorMaps[i].back = this.genColorMapFromSettings(this.Settings[i].back);
            }, 1100);
        }
    }

    componentDidMount() {
        this.setState({mattressName: window.settings.mattressName});
        if (window.settings.system == 'imperial') {
            this.setState({min: 0, max: 2});
        } else {
            this.setState({min: 0, max: 200});
        }
        //window.export = new Object();
        if (window.export == null || window.testMode) {
            window.export = this.cloneObject(window.demo);
            window.export.mattressName = this.cloneObject(window.settings.mattressName);

            this.setState({isScanSensors: 3});
            window.setTimeout(()=>{this.loadFromExport();}, 1200);
        } else {
            if (window.export.sensors == undefined) {
                this.scanSensors();
                window.core.postSensorReadings.connect(this.onGetData);
            } else {
                this.setState({isScanSensors: 3});
                window.setTimeout(()=>{this.loadFromExport();}, 1200);
            }
        }

        this.timer = window.setInterval(() => {
            this.needUpdate = true;
        }, 500);
        window.wkSwipeAction = this.scrollFromJS;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setOrientation, false);
        if (this.state.play) {
            this.onPlayStop();
        }
        window.clearInterval(this.timer);
        console.log('Destructor');
        delete this.defSettings;
        delete this.defColormap;
        delete this.Settings;
        delete this.ColorMaps;
        delete this.storeSensors;
        delete this.lastSensor;
    }

    onChangePosition() {
        console.log('Change Position');
        let needPlay = false;
        let position = this.state.position;
        let sensor = null;
        if (this.state.play) {
            needPlay = true;
            this.onPlayStop();
        }
        if (position == 'side') {position = 'back';} else {position = 'side';}
        this.setState({position: position});
        window.setTimeout(()=>{
            for (let i=0; i<4; i++) {
                if (position=='side') {sensor = this.storeSensors[i].side;} else {sensor = this.storeSensors[i].back;}
                if (sensor === null) {
                    if (i==0) this.Mattress0.clearMap();
                    if (i==1) this.Mattress1.clearMap();
                    if (i==2) this.Mattress2.clearMap();
                    if (i==3) this.Mattress3.clearMap();
                } else {
                    if (i==0) this.Mattress0.setColorMap(position=='back'?this.ColorMaps[0].back:this.ColorMaps[0].side);
                    if (i==0) this.Mattress1.setColorMap(position=='back'?this.ColorMaps[1].back:this.ColorMaps[1].side);
                    if (i==0) this.Mattress2.setColorMap(position=='back'?this.ColorMaps[2].back:this.ColorMaps[2].side);
                    if (i==0) this.Mattress3.setColorMap(position=='back'?this.ColorMaps[3].back:this.ColorMaps[3].side);

                    if (i==0) this.Mattress0.renderMap(sensor);
                    if (i==1) this.Mattress1.renderMap(sensor);
                    if (i==2) this.Mattress2.renderMap(sensor);
                    if (i==3) this.Mattress3.renderMap(sensor);

                    if (i==0) this.Mattress0.setStatistic(sensor);
                    if (i==1) this.Mattress1.setStatistic(sensor);
                    if (i==2) this.Mattress2.setStatistic(sensor);
                    if (i==3) this.Mattress3.setStatistic(sensor);

                    if (i==0) this.Mattress0.updateDigits(sensor);
                    if (i==1) this.Mattress1.updateDigits(sensor);
                    if (i==2) this.Mattress2.updateDigits(sensor);
                    if (i==3) this.Mattress3.updateDigits(sensor);
                }
            }
        }, 100);

        if (needPlay) {
            window.setTimeout(()=>{this.onPlayStop();}, 200);
        }
    }

    onChangeMattressName(id, name) {
        let names = this.state.mattressName;
        names[id] = name;
        this.setState({mattressName: names});
    }

    onActivateMattress(e) {
        this.setState(state => ({
            mattressActivated: state.mattressActivated + 1,
            selectedMattress: state.mattressActivated
        }));
    }

    setOrientation() {
        this.setState({portrait: window.matchMedia("(orientation: portrait)").matches});
    }

    onScrollMattress() {
        let c = 3;
        if (this.state.mattressActivated==2) {c = 3;} else {c = 4}
        let left = document.getElementById('Mattresses').scrollLeft;
        let widthMat = document.getElementById('OrientationWrapper').offsetWidth / c;
        let page = Math.round(left / widthMat);
        this.setState({portraitViewRotation: page});
        this.Mattress0.hideZoom();
        this.Mattress1.hideZoom();
        this.Mattress2.hideZoom();
        this.Mattress3.hideZoom();
    }

    onEndScroll() {

        /*
        let options = new Object({
            containerId: 'Mattresses',
            targetId: 'MattressID_' + this.state.portraitViewRotation,
            duration: 600,
            scrollAxis: 'X',
            ignoreCancelEvents: true
        });

        window.setTimeout(()=>{animateScroll.scrollToObject(options);}, 100);
        */

    }

    getAveragePressureReduction(averagePressure0, averagePressure1, surfaceArea0, surfaceArea1) {

        if (surfaceArea1 <= surfaceArea0) {
            return 0;
        } else {
            let AveragePressureReduction = (averagePressure0 - averagePressure1) * 100 / (averagePressure0>0?averagePressure0:1);
            if (AveragePressureReduction < 0) {return 0;} else {return AveragePressureReduction;}
        }


        //return (averagePressure0 - averagePressure1) * 100 / (averagePressure0>0?averagePressure0:1);
    }

    getSurfaceReduction(surfaceArea0, surfaceArea1) {
        if (surfaceArea1 <= surfaceArea0 || surfaceArea1 == 0) {
            return 0;
        } else {
            let res = (surfaceArea1 - surfaceArea0) * 200 / surfaceArea1;
            //console.log(res);
            return res;
        }
    }

    onGetData(value) {
        if (this.state.play) {
            if (this.state.selectedMattress==0) {this.Mattress0.renderMap(value.sensor, this.state.position=='back'?this.ColorMaps[0].back:this.ColorMaps[0].side);}
            if (this.state.selectedMattress==1) {this.Mattress1.renderMap(value.sensor, this.state.position=='back'?this.ColorMaps[1].back:this.ColorMaps[1].side);}
            if (this.state.selectedMattress==2) {this.Mattress2.renderMap(value.sensor, this.state.position=='back'?this.ColorMaps[2].back:this.ColorMaps[2].side);}
            if (this.state.selectedMattress==3) {this.Mattress3.renderMap(value.sensor, this.state.position=='back'?this.ColorMaps[3].back:this.ColorMaps[3].side);}
            if (this.needUpdate) {
                if (this.state.selectedMattress==0) this.Mattress0.setStatistic(value.sensor);
                if (this.state.selectedMattress==1) this.Mattress1.setStatistic(value.sensor);
                if (this.state.selectedMattress==2) this.Mattress2.setStatistic(value.sensor);
                if (this.state.selectedMattress==3) this.Mattress3.setStatistic(value.sensor);

                if (this.state.selectedMattress==0) this.Mattress0.updateDigits(value.sensor);
                if (this.state.selectedMattress==1) this.Mattress1.updateDigits(value.sensor);
                if (this.state.selectedMattress==2) this.Mattress2.updateDigits(value.sensor);
                if (this.state.selectedMattress==3) this.Mattress3.updateDigits(value.sensor);

                if (this.state.selectedMattress==0) {
                    this.averagePressure0 = value.sensor.sensorSpecific.statistics.averagePressure.value;
                    this.surfaceArea0 = value.sensor.sensorSpecific.statistics.surfaceArea.value;
                }

                if (this.state.selectedMattress==1) {
                    /*
                    this.setState({
                        averagePressureReduction: this.getAveragePressureReduction(this.averagePressure0, value.sensor.sensorSpecific.statistics.averagePressure.value, this.surfaceArea0,value.sensor.sensorSpecific.statistics.surfaceArea.value)
                    });
                    */
                    this.setState({
                        averagePressureReduction: this.getSurfaceReduction(this.surfaceArea0, value.sensor.sensorSpecific.statistics.surfaceArea.value)
                    });
                }


                this.needUpdate = false;
            }
            if (this.state.selectedMattress==0) {
                this.calculateSettings(value.sensor);
                value.sensor.sensorSpecific.isobar.brightness = this.state.position=='side'?this.brightnessSide:this.brightnessBack;
                value.sensor.sensorSpecific.isobar.contrast = this.state.position=='side'?this.contrastSide:this.contrastBack;
                window.core.setScanSettings(value.sensor);
            }
            this.lastSensor = this.cloneObject(value.sensor);
        }
    }

    toExport(goHome = true) {
        if (this.storeSensors[0].back !== null && this.storeSensors[1].back !== null) {
            if (window.export == null) window.export = Object();
            if (window.settings.emailMode == 'custom') {
                window.export.customSMTP = {
                    host: window.settings.emailServer,
                    port: window.settings.emailPort,
                    user: window.settings.emailUser,
                    password: window.settings.emailPassword,
                    type: window.settings.emailProtocol
                }
            } else {
                delete window.export.customSMTP;
            }
            this.storeSensors[0].backPNG = this.Mattress0.renderToPNG();
            if (this.state.averagePressureReduction > 1) {
                html2canvas(document.getElementById('averagePressureReduction')).then((canvas) => {
                    let pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
                    for (let i = 0, len = pixels.data.length; i < len; i += 4) {
                        if (pixels.data[i] == 255 && pixels.data[i + 1] == 255 && pixels.data[i + 2] == 255) {
                            pixels.data[i + 3] = 0;
                        }
                    }
                    canvas.getContext("2d").putImageData(pixels, 0, 0);

                    let out = document.createElement('canvas');
                    let c = out.getContext("2d");
                    let map = this.Mattress1.Map2d.renderer2d.domElement;
                    out.width = map.width;
                    out.height = map.height;
                    c.drawImage(map, 0, 0, map.width, map.height, 0, 0, map.width, map.height);
                    c.drawImage(canvas, 0, 0, canvas.width, canvas.height, 10, map.height - canvas.height - 10, canvas.width, canvas.height);


                    let strMime = "image/png";
                    let imgData = out.toDataURL(strMime);
                    this.storeSensors[1].backPNG = imgData;

                    //console.log(this.storeSensors[1].backPNG);

                    window.export.sensors = this.storeSensors;
                    window.export.datetime = Date.now();
                    window.export.mattressName = this.state.mattressName;
                    window.export.demoMode = this.state.demoMode;
                    window.export.Settings = this.Settings;
                    window.export.mattressActivated = this.state.mattressActivated;
                    window.export.mode = window.settings.mode;
                    this.createEmailTemplate();
                    this.createPreview();
                    if (goHome) window.setTimeout(() => {this.props.history.push('/');}, 500);
                });
            } else {
                this.storeSensors[1].backPNG = this.Mattress1.renderToPNG();
                window.export.sensors = this.storeSensors;
                window.export.datetime = Date.now();
                window.export.mattressName = this.state.mattressName;
                window.export.demoMode = this.state.demoMode;
                window.export.Settings = this.Settings;
                window.export.mattressActivated = this.state.mattressActivated;
                this.createEmailTemplate();
                this.createPreview();
                if (goHome) window.setTimeout(() => {this.props.history.push('/');}, 500);

            }
        } else {
            window.export = null;
            if (goHome) this.props.history.push('/');
        }




        //window.export.ColorMaps = this.ColorMaps;

        //console.log(window.export);
    }

    createEmailTemplate() {
        let body = document.getElementById('template').innerText;

        body = body.replace('{{tplHello}}', window.loc.tplHello);
        body = body.replace('{{tplTitle2}}', window.loc.tplTitle2);
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
        body = body.replace('{{ap1}}', Number.parseFloat(window.export.sensors["0"].back.sensorSpecific.statistics.averagePressure.value).toFixed(1));
        body = body.replace('{{sa1}}', Number.parseFloat(window.export.sensors["0"].back.sensorSpecific.statistics.surfaceArea.value).toFixed(0));
        body = body.replace('{{oa1}}', Number.parseFloat(window.export.sensors["0"].back.sensorSpecific.statistics.excessivePressureArea.value).toFixed(0));
        body = body.replace('{{ap2}}', Number.parseFloat(window.export.sensors["1"].back.sensorSpecific.statistics.averagePressure.value).toFixed(1));
        body = body.replace('{{sa2}}', Number.parseFloat(window.export.sensors["1"].back.sensorSpecific.statistics.surfaceArea.value).toFixed(0));
        body = body.replace('{{oa2}}', Number.parseFloat(window.export.sensors["1"].back.sensorSpecific.statistics.excessivePressureArea.value).toFixed(0));

        body = body.replace('{{title1}}', window.export.mattressName[0]);
        body = body.replace('{{title2}}', window.export.mattressName[1]);

        body = body.replace(new RegExp('{{unit1}}', 'g'), window.settings.system=='metric'?window.loc.unitGCM2:window.loc.unitPSI);
        body = body.replace(new RegExp('{{unit2}}', 'g'), window.settings.system=='metric'?window.loc.unitCM2:window.loc.unitIN2);
        body = body.replace(/src="/g, 'src="cid:');



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
            {name: 'map1.png', type: 'generated', data: window.export.sensors["0"].backPNG},
            {name: 'map2.png', type: 'generated', data: window.export.sensors["1"].backPNG}
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


    }

    createPreview() {
        //window.export.sensors[this.bestScore].backPNG;
        //window.export.sensors[this.bestScore].sidePNG;
        //data: window.export.sensors["0"].backPNG;
        //data: window.export.sensors["1"].backPNG;
        let cnv = document.createElement('canvas');
        let ctx = cnv.getContext("2d");
        let image = new Image();
        image.src = window.export.sensors["0"].backPNG;
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
        image2.src = window.export.sensors["1"].backPNG;
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

    scrollFromJS(direction) {
        let curMat = this.state.portraitViewRotation;
        let maxMat = 1;
        if (this.state.mattressActivated != 2) maxMat = 2;
        if (direction == 1) curMat--;
        if (direction == 2) curMat++;
        if (curMat < 0) curMat = 0;
        if (curMat >= maxMat) curMat = maxMat;
        if (curMat != this.state.portraitViewRotation) {
            let options = new Object({
                containerId: 'Mattresses',
                targetId: 'MattressID_' + curMat,
                duration: 600,
                scrollAxis: 'X',
                ignoreCancelEvents: true
            });

            //Removed for DUO mode
            //animateScroll.scrollToObject(options);
            //this.setState({portraitViewRotation: curMat});
        }
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
            this.setState({isEmail: 3});
            this.toExport(false);
            window.setTimeout(() => {
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
            }, 1000);
        } else {
            this.setState({errorEmail: window.loc.mainEmailIncorrect});
        }
    }

    setDevNewSettings() {
        this.ColorMaps[1].back = this.genColorMapFromSettings(this.Settings[1].back);
        this.Mattress1.setColorMap(this.ColorMaps[1].back);
        this.Mattress1.Map2d.renderer2d.render(this.Mattress1.Map2d.scene2d, this.Mattress1.Map2d.camera2d);
        this.forceUpdate();
    }


    render() {
        let matWidth = '';
        if (this.state.portrait) {
            if (this.state.mattressActivated == 2) {
                matWidth = 'calc((100% - 2*15px)/3)';
            } else {
                matWidth = 'calc((100% - 3*15px)/4)';
            }
        } else {
            matWidth = 'calc(50% - 10px)';
        }

        let Sensors = [];
        this.state.sensors.map((el, key) => {
            Sensors.push(
                <option key={key} value={key}>{window.loc.mainSensor} - {el.sensorSerial}</option>
            );
        });

        let Disable

        return (
            <Page
                backButton={(window.export!==null && window.export.stored)?'/Sessions':undefined}
                {...this.props}
            >
                <Colorbar
                    min={this.state.min}
                    max={this.state.max}
                    isScale={window.settings.isScale}
                    unit={window.settings.system=='imperial'?'psi':'g/cm²'}
                />
                {/*
                <div className="Isobar">
                    <img src="img/Color_Bar_sm.png" />
                    <label className="Low">{window.loc.mainLowLabel}</label>
                    <label className="Pressure">{window.loc.mainPressureLabel}</label>
                    <label className="High" onClick={() => {this.setState({devPanel: !this.state.devPanel})}}>{window.loc.mainHighLabel}</label>
                </div>
                */}
                <div className="Mattresses" id="Mattresses" onScroll={this.onScrollMattress} onTouchEnd={this.onEndScroll}>
                    <div className="OrientationWrapper" id="OrientationWrapper"
                        style={this.state.portrait?(this.state.mattressActivated==2?{width:'150%'}:{width:'200%'}):{width:'100%'}}
                    >
                        <Mattress
                            id={0}
                            mattressName={this.state.mattressName[0]}
                            readOnly={this.state.stepMode==2}
                            demoMode={this.state.demoMode}
                            onChangeMattressName={this.onChangeMattressName}
                            portrait={this.state.portrait}
                            matWidth={matWidth}
                            ref={instance => {this.Mattress0 = instance;}}
                            enabled={true}
                            selectedMattress={this.state.selectedMattress}
                            onChangeMattress={this.onChangeMattress}
                            isStdDeviation={true}
                        />
                        <Mattress
                            id={1}
                            mattressName={this.state.mattressName[1]}
                            readOnly={this.state.stepMode==2}
                            demoMode={this.state.demoMode}
                            onChangeMattressName={this.onChangeMattressName}
                            portrait={this.state.portrait}
                            matWidth={matWidth}
                            ref={instance => {this.Mattress1 = instance;}}
                            enabled={true}
                            selectedMattress={this.state.selectedMattress}
                            onChangeMattress={this.onChangeMattress}
                            averagePressureReduction={this.state.averagePressureReduction}
                            isStdDeviation={true}
                        />
                        <Mattress
                            id={2}
                            mattressName={this.state.mattressName[2]}
                            readOnly={this.state.stepMode==2}
                            demoMode={this.state.demoMode}
                            onChangeMattressName={this.onChangeMattressName}
                            portrait={this.state.portrait}
                            matWidth={matWidth}
                            ref={instance => {this.Mattress2 = instance;}}
                            enabled={this.state.mattressActivated >= 3}
                            selectedMattress={this.state.selectedMattress}
                            onChangeMattress={this.onChangeMattress}
                        />
                        <Mattress
                            id={3}
                            mattressName={this.state.mattressName[3]}
                            readOnly={this.state.stepMode==2}
                            demoMode={this.state.demoMode}
                            onChangeMattressName={this.onChangeMattressName}
                            portrait={this.state.portrait}
                            matWidth={matWidth}
                            ref={instance => {this.Mattress3 = instance;}}
                            enabled={this.state.mattressActivated >= 4}
                            selectedMattress={this.state.selectedMattress}
                            onChangeMattress={this.onChangeMattress}
                        />

                        {(this.state.mattressActivated == 2 || this.state.mattressActivated == 3) &&
                        <div className="MattressPlaceholder"
                            style={{width: matWidth}}
                        >
                            <div className="Map2dPlaceholder">
                                <button className="AddMattressButton"
                                    onClick={this.onActivateMattress}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                </button>
                            </div>
                        </div>
                        }
                    </div>
                </div>
                <div className="Controls">
                    <div style={{height: 20}}></div>
                    <select className="SensorSelector" onChange={(el) => {
                        this.onChangeSensor(el.target.value)
                    }} value={this.state.curSensor}>
                        <option key={'refresh'} value={'refresh'}>{window.loc.mainRefreshSensors}</option>
                        {Sensors}
                    </select>

                    {this.state.stepMode == 1 &&
                    <button className={this.state.play ? 'ButtonPlay Orange' : 'ButtonPlay Green'}
                            onClick={this.onPlayStop} disabled={this.state.demoMode}
                            onTouchStart={() => {}}
                    >
                        {this.state.play == false &&
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M0 0h24v24H0z" fill="none"/>
                                <path
                                    d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                            <span>{window.loc.mainStartButton}</span>
                        </div>
                        }
                        {this.state.play == true &&
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M0 0h24v24H0z" fill="none"/>
                                <path
                                    d="M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z"/>
                            </svg>
                            <span>{window.loc.mainStopButton}</span>
                        </div>
                        }
                    </button>
                    }
                    <button
                        className="Email"
                        onTouchStart={() => {}}
                        onClick={() => {this.setState({isEmail: 1});}}
                    >
                        <div>
                            <svg width="24" height="24" viewBox="0 0 24 24"><path  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
                            <span>{window.loc.mainEmailButton}</span>
                        </div>
                    </button>
                    <button
                        className="Done"
                        onTouchStart={() => {}}
                        disabled={this.state.play}
                        onClick={() => {
                            this.toExport();
                            //this.props.history.push('/');
                        }}
                    >
                        <div>
                            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                            <span>{window.loc.mainDoneButton}</span>
                        </div>
                    </button>

                </div>

                {(this.state.isScanSensors > 0 ) &&
                <div className="ScanSensorsBack">
                    <div className="ScanSensorsWindow">
                        {this.state.isScanSensors==1 && <div>
                            <h1 style={{marginBottom: '5.208vh'}}>{window.loc.mainScanningLabel}</h1>
                            <Loader/>
                        </div>}
                        {this.state.isScanSensors==2 && <div>
                            <h1>{window.loc.mainSensorNotFound}</h1>
                            <button
                                onClick={() => {this.scanSensors()}}
                                onTouchStart={() => {}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                </svg>
                                <span>{window.loc.mainRetryButton}</span>
                            </button>
                            <button
                                onClick={() => {
                                    window.export = this.cloneObject(window.demo);
                                    this.setState({demoMode: true, isScanSensors: 3});
                                    window.setTimeout(()=>{this.loadFromExport();}, 1200);
                                    //this.loadFromExport();
                                }}
                                style={{marginLeft: '1.953vw'}}
                                className="Green"
                                onTouchStart={() => {}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                </svg>
                                <span>{window.loc.mainDemoModeButton}</span>
                            </button>
                        </div>}
                        {this.state.isScanSensors==3 && <div>
                            <h1 style={{marginBottom: '5.208vh'}}>{window.loc.mainPleaseWaitLabel}</h1>
                            <Loader/>
                        </div>}
                    </div>
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
                {this.state.devPanel &&
                <div className="DevPanel">
                    <h1>Brightness: {this.Settings[1].back.center}</h1>
                    <input
                        type="range"
                        min="-50"
                        max="50"
                        step="1"
                        value={this.Settings[1].back.center}
                        onChange={(e) => {
                            this.Settings[1].back.center = parseInt(e.target.value);
                            this.brightnessBack123 = parseInt(e.target.value);
                            this.setDevNewSettings();
                        }}
                    />
                    <h1>Contrast: {this.Settings[1].back.distribution}</h1>
                    <input
                        type="range"
                        min="-200"
                        max="200"
                        step="1"
                        value={this.Settings[1].back.distribution}
                        onChange={(e) => {
                            this.Settings[1].back.distribution = parseInt(e.target.value);
                            this.contrastBack123 = parseInt(e.target.value);
                            this.setDevNewSettings();
                        }}
                    />
                    <h1>Lower threshold: {this.Settings[1].back.min}</h1>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={this.Settings[1].back.min}
                        onChange={(e) => {
                            this.Settings[1].back.min = parseInt(e.target.value);
                            this.setDevNewSettings();
                        }}
                    />
                    <h1>Upper threshold: {this.Settings[1].back.max}</h1>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={this.Settings[1].back.max}
                        onChange={(e) => {
                            this.Settings[1].back.max = parseInt(e.target.value);
                            this.setDevNewSettings();
                        }}
                    />
                </div>}

            </Page>
        );
    }
}

export default MainPageDuo;
