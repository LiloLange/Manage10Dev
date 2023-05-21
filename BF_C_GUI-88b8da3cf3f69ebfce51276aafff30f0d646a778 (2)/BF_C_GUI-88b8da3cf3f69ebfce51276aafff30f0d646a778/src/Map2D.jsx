/*
Component Map2D (Pressure Map)

Properties:
    colorMap = {CurColorMap0} // Color Map
    idSensor = {this.state.curSensor} // Sensor ID (0 or 1)
    Isobar = {this.isobar} // Link to Isobar
    idComp = "MapSett" // Unique ID
    updateLabels = {this.updateLabels} // Link to function for updating labels (in Settings)
Methods:
    updateMap() // Render Pressure Map from previous data
    clearMap2D() // Clear Pressure Map and delete previous data
 */

import React from 'react';
import {getMassCenter, Smoothing, Normalize, getMaximums, getVectors, getStats, getMaximumsShoulder, isInside} from './Calculation.jsx';


class Map2D extends React.Component {
    constructor(props) {
        super(props);
        this.scene2d = null;
        this.camera2d = null;
        this.cameraZoom = null;
        this.renderer2d = null;
        this.renderZoom = null;
        this.geometry = null;
        this.material = null;
        this.obj2d = null;
        //renderer2d.setClearColor (0xffffff);
        this.obj2d = [];
        this.mesh2d = [];
        this.col2d = 27;
        this.row2d = 64;
        this.csize2d = window.cellSize;
        this.texture2d = null;
        this.w2d_cont = 0;
        this.h2d_cont = 0;
        this.curIdSensor = '';
        this.previousData = null;
        this.offsetLeft = 0;
        this.offsetTop = 0;
        this.zoomWidth = 6;
        this.zoomHeight = 6;
        this.zoomScale = 30;
        this.canvas = null;
        this.ZoomPosition = null;

        this.readingsT = null;
        this.colormapT = null;
        this.lastData = null;
        //this.cog_row = 32;
        //this.cog_col = 13.5;
        this.cog_row = null;
        this.cog_col = null;

        this.createMap2D = this.createMap2D.bind(this);
        this.onResize = this.onResize.bind(this);
        this.renderMap = this.renderMap.bind(this);
        this.renderMap2D = this.renderMap2D.bind(this);
        this.clearMap2D = this.clearMap2D.bind(this);
        this.removeWEBGL = this.removeWEBGL.bind(this);
        this.onGetData = this.onGetData.bind(this);
        this.updateMap = this.updateMap.bind(this);
        this.normalize = this.normalize.bind(this);
        this.renderToPNG = this.renderToPNG.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.hideZoom = this.hideZoom.bind(this);
        this.updateDigits = this.updateDigits.bind(this);
        this.preventDef = this.preventDef.bind(this);
        this.setColorMap = this.setColorMap.bind(this);
        this.renderMapT = this.renderMapT.bind(this);
        this.createDigits = this.createDigits.bind(this);
        this.onChangeOrientation = this.onChangeOrientation.bind(this);
        this.updateCog = this.updateCog.bind(this);
        this.onResizeHandler = this.onResizeHandler.bind(this);
        this.hideMap = this.hideMap.bind(this);
        this.showMap = this.showMap.bind(this);
        this.state = {
            zoomWindow: false,
            shiftZoom: false,
            cog_right: 0,
            cog_bottom: 0,
            cog_opacity: 0,

            t1: '',
            t2: '',
            t3: '',
            t4: '',
            tempClass: '',
        };
    }

    updateCog(col, row) {
        if (col === undefined || row === undefined) {
            col = this.cog_col;
            row = this.cog_row;
        } else {
            this.cog_col = col;
            this.cog_row = row;
        }
        if (row === null || col === null || this.canvas === null) {
            this.setState({cog_opacity: 0});
        } else {
            let right = 0;
            let bottom = 0;
            let w = this.canvas.offsetWidth;
            let h = this.canvas.offsetHeight;
            if (this.props.portrait) {
                right = w - (col / this.col2d) * w - 7.5;
                bottom = (row / this.row2d) * h - 7.5 + 3;
            } else {
                right = (row / this.row2d) * w - 7.5;
                bottom = (col / this.col2d) * h - 7.2 + 3;
            }


            this.setState({cog_right: right, cog_bottom: bottom});
            if (this.state.cog_opacity == 0) {
                window.setTimeout(() => {
                    if (this.lastData !== null) this.setState({cog_opacity: 1});
                }, 100);
            }
        }
    }

    preventDef(e) {
        e.preventDefault();
    }

    /* Disconnect from back-end when Component has been unmounted. */
    componentWillUnmount() {
        this.removeWEBGL();
        window.removeEventListener('resize', this.onResizeHandler, false);
        window.removeEventListener('orientationchange', this.onChangeOrientation, false);
        //if (!window.test) core.postSensorReadings.disconnect(this.onGetData);
        delete this.scene2d;
        delete this.camera2d;
        delete this.cameraZoom;
        delete this.renderer2d;
        delete this.renderZoom;
        delete this.geometry;
        delete this.material;
        delete this.obj2d;
        delete this.mesh2d;
        delete this.texture2d;
        delete this.previousData;
        delete this.canvas;
    }

    /* This function is called when Data is received from Back-end */
    onGetData(returnValue) {
        //this.renderMap(returnValue);
    }

    onChangeOrientation() {
        this.hideZoom();
    }

    /* Initialize settings after the Map2D has been created. */
    componentDidMount() {
        window.setTimeout(()=>{this.createMap2D(this.col2d, this.row2d, this.csize2d);}, 1000);
        //this.createMap2D(this.col2d, this.row2d, this.csize2d);
        this.curIdSensor = this.props.idSensor;

        //if (!window.test) core.postSensorReadings.connect(this.onGetData);

        window.addEventListener('orientationchange', this.onChangeOrientation,false);
    }

    componentWillMount() {
        if (this.props.portrait) {
            //this.zoomScale = window.screen.availWidth * 0.039;
            this.zoomScale = window.innerWidth * 0.039;
        } else {
            //this.zoomScale = window.screen.availHeight * 0.039;
            this.zoomScale = window.innerHeight * 0.039;
        }
    }

    /* Callback function for WebGL */
    renderMap2D() {
        if (this.camera2d && this.renderer2d) {
            this.renderer2d.render(this.scene2d, this.camera2d);
        }
        requestAnimationFrame(this.renderMap2D);
    }

    renderToPNG() {
        //console.log('Render to PNG');
        let strMime = "image/png";
        let imgData = this.renderer2d.domElement.toDataURL(strMime);
        if (!this.props.portrait) {
            let cnv = document.createElement('canvas');
            cnv.width = this.renderer2d.domElement.height;
            cnv.height = this.renderer2d.domElement.width;
            let ctx = cnv.getContext('2d');
            if (this.renderer2d.domElement.width != 0) {
                ctx.rotate(90 * Math.PI / 180);
                ctx.translate(0, -cnv.width);
                ctx.drawImage(this.renderer2d.domElement, 0, 0);
            }


            imgData = cnv.toDataURL(strMime);
            cnv.remove();
        }
        //console.log(imgData);

        return imgData;
    }

    /* Remove WebGL Objects */
    removeWEBGL() {
        //console.log('Remove 2D Objects');
        //console.log(this.renderer2d);
        if (this.canvas) {
            this.canvas.removeEventListener('touchmove', this.onZoom);
            this.canvas.removeEventListener('touchstart', this.preventDef);
        }
        if (this.renderer2d!==null && this.renderer2d!==undefined) {
            /*
            for (let i=0; i < this.scene2d.children.length; i++){
                let obj = this.scene2d.children[i];
                this.scene2d.remove(obj);
            }
            */
            while(this.scene2d.children.length > 0){

                //this.scene2d.remove(this.scene2d.children[0]);
                let removeTarget = this.scene2d.children[0];
                if (removeTarget instanceof THREE.Mesh) {
                    removeTarget.geometry.dispose();
                    removeTarget.material.dispose();
                }
                this.scene2d.remove(removeTarget);
            }

            this.scene2d = undefined;



            let cont = document.getElementById('contCanvas2d'+this.props.idComp);

            while (cont.firstChild && cont.firstChild.nodeName!='IMG') {
                cont.removeChild(cont.firstChild);
            }

        }
        if (this.renderZoom!==null && this.renderZoom!==undefined) {


            let cont = document.getElementById('zoom2d'+this.props.idComp);
            while (cont.firstChild) {
                cont.removeChild(cont.firstChild);
            }
            /*
            cont = document.getElementById('zoom2dAxis'+this.props.idComp);
            while (cont.firstChild) {
                cont.removeChild(cont.firstChild);
            }

             */
        }

    }

    hideZoom() {
        function getOffset(el) {
            let rect = el.getBoundingClientRect();
            return {
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY
            };
        }
        this.setState({zoomWindow: false});
        this.offsetLeft = getOffset(this.canvas).left;
        this.offsetTop = getOffset(this.canvas).top;
        this.ZoomPosition = null;
    }


    onZoom(e) {
        let absX = e.targetTouches["0"].pageX;
        let absY = e.targetTouches["0"].pageY;
        //let canvasWidth = e.targetTouches["0"].target.clientWidth;
        //let canvasHeight = e.targetTouches["0"].target.clientHeight;
        let canvasWidth = this.canvas.clientWidth;
        let canvasHeight = this.canvas.clientHeight;

        let relX = absX - this.offsetLeft;
        let relY = absY - this.offsetTop;

        //console.log('absX: '+absX+'; absY: '+absY);
        //console.log('relX: '+relX+'; relY: '+relY);
        //console.log(window.screen.width);
        //console.log(e);
        if (relX >= 0 && relX <= canvasWidth && relY >= 0 && relY <= canvasHeight) {
            //console.log(e);

            if (this.state.zoomWindow == false) {
                this.setState({zoomWindow: true});
            }
            // Position of Zoom window
            {/*
            let zoomWindow = document.getElementById('zoom2d'+this.props.idComp);
            let addX = 20;
            if (absY < window.screen.availHeight / 2) {
                zoomWindow.style.top = absY - (this.zoomHeight * this.zoomScale / 2) + 'px';
                addX = 60;
            } else {
                zoomWindow.style.top = absY - 20 - this.zoomHeight * this.zoomScale + 'px';
            }
            if (absX < window.screen.availWidth / 2) {
                zoomWindow.style.left = absX + addX + 'px';
            } else {
                zoomWindow.style.left = absX - addX - this.zoomWidth * this.zoomScale + 'px';
            }
            */}

            // New position
            let ZoomWrapper = document.getElementById('wrapper'+this.props.idComp);
            let InWrapper = document.getElementById('inWrapper'+this.props.idComp);
            InWrapper.style.transformOrigin = (this.zoomHeight * this.zoomScale / 2) + 'px ' + (this.zoomHeight * this.zoomScale / 2) + 'px';

            let zoomWindow = document.getElementById('zoom2d'+this.props.idComp);
            //let zoomHeader = document.getElementById('zoom2dHeader'+this.props.idComp);
            let zoomCenter = document.getElementById('ZoomCenter'+this.props.idComp);
            let addX = 50;
            let scale = 7;
            if (this.ZoomPosition === null) {
                if (relX < (canvasWidth / 2)) {
                    this.ZoomPosition = 'right';
                    ZoomWrapper.style.transformOrigin = - addX + 'px ' + (this.zoomHeight * this.zoomScale / 2) + 'px';
                    zoomCenter.style.left = -51 - this.zoomWidth * scale/2 + 'px';
                } else {
                    this.ZoomPosition = 'left';
                    ZoomWrapper.style.transformOrigin = addX + this.zoomWidth * this.zoomScale + 'px ' + (this.zoomHeight * this.zoomScale / 2) + 'px';
                    zoomCenter.style.left = +48 +  this.zoomWidth * this.zoomScale - this.zoomWidth * scale/2 + 'px';
                }
            }



            ZoomWrapper.style.top = absY - (this.zoomHeight * this.zoomScale / 2) + 'px';
            //zoomHeader.style.top = - this.zoomScale + 'px';
            if (this.ZoomPosition == 'right') {
                ZoomWrapper.style.left = absX + addX + 'px';
            } else {
                ZoomWrapper.style.left = absX - addX - this.zoomWidth * this.zoomScale + 'px';
            }
            if (relX < (canvasWidth / 2)) {
                this.setState({shiftZoom: this.ZoomPosition == 'left'});
            } else {
                this.setState({shiftZoom: this.ZoomPosition == 'right'});
            }
            /*
            zoomWindow.style.top = absY - (this.zoomHeight * this.zoomScale / 2) + 'px';
            zoomHeader.style.top = absY - (this.zoomHeight * this.zoomScale / 2) - this.zoomScale + 'px';
            if (relX < (canvasWidth / 2)) {
                zoomWindow.style.left = absX + addX + 'px';
                zoomHeader.style.left = absX + addX + 'px';
            } else {
                zoomWindow.style.left = absX - addX - this.zoomWidth * this.zoomScale + 'px';
                zoomHeader.style.left = absX - addX - this.zoomWidth * this.zoomScale + 'px';
            }
            */
            // ^^New position^^



            if (this.props.portrait) {
                this.cameraZoom.position.x = (10 * (this.col2d * (relX) / canvasWidth)) - (10 * this.zoomHeight / 2);
                this.cameraZoom.position.y = (10 * (this.row2d * (canvasHeight - relY) / canvasHeight)) - (10 * this.zoomWidth / 2);
            } else {
                this.cameraZoom.position.x = (10 * (this.col2d * (canvasHeight - relY) / canvasHeight)) - (10 * this.zoomHeight / 2);
                this.cameraZoom.position.y = (10 * (this.row2d * (canvasWidth - relX) / canvasWidth)) - (10 * this.zoomWidth / 2);
            }


            this.renderZoom.render(this.scene2d, this.cameraZoom);


            if (this.props.portrait) {
                let digits = document.getElementById('digits2d'+this.props.idComp);
                digits.style.left = (-this.zoomScale * this.col2d * relX / canvasWidth) + (this.zoomScale * this.zoomWidth / 2) +'px';
                digits.style.top = (-this.zoomScale * this.row2d * relY / canvasHeight) + (this.zoomScale * this.zoomHeight / 2) +'px';

                //let Axis = document.getElementById('AxisDigits2d'+this.props.idComp);
                //Axis.style.left = (-this.zoomScale * this.col2d * relX / canvasWidth) + (this.zoomScale * this.zoomWidth / 2) +'px';
            } else {
                let digits = document.getElementById('digits2d'+this.props.idComp);
                digits.style.left = (-this.zoomScale * this.row2d * relX / canvasWidth) + (this.zoomScale * this.zoomWidth / 2) +'px';
                digits.style.top = (-this.zoomScale * this.col2d * relY / canvasHeight) + (this.zoomScale * this.zoomHeight / 2) +'px';

                //let Axis = document.getElementById('AxisDigits2d'+this.props.idComp);
                //Axis.style.left = (-this.zoomScale * this.row2d * relX / canvasWidth) + (this.zoomScale * this.zoomWidth / 2) +'px';
            }



        }
        e.preventDefault();
    }

    setColorMap(colormapT) {
        this.colormapT.image.data = colormapT.image.data;
        this.colormapT.needsUpdate = true;
    }

    createDigits() {
        let zoomWindow = document.getElementById('zoom2d' + this.props.idComp);

        //let zoomAxis = document.getElementById('zoom2dAxis' + this.props.idComp);
        //zoomAxis.innerHTML = '';
        let oldDigits = document.getElementById('digits2d' + this.props.idComp);
        if (oldDigits) oldDigits.remove();


        let digits = document.createElement('div');
        //let AxisDigits = document.createElement('div');

        if (this.props.portrait) {


            digits.className = 'Digits';
            digits.id = 'digits2d' + this.props.idComp;
            digits.style.width = this.col2d * this.zoomScale + 'px';
            digits.style.height = this.row2d * this.zoomScale + 'px';

            /*
            AxisDigits.className = 'AxisDigits';
            AxisDigits.id = 'AxisDigits2d' + this.props.idComp;
            AxisDigits.style.width = this.col2d * this.zoomScale + 'px';
            AxisDigits.style.height = 1 * this.zoomScale + 'px';

             */

            for (let c = 0; c < this.col2d; c++) {
                let d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (c) * this.zoomScale + 'px';
                d.style.top = (this.row2d) * this.zoomScale + 'px';
                d.innerText = (c + 1).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);

                d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (c) * this.zoomScale + 'px';
                d.style.top = (-1) * this.zoomScale + 'px';
                d.innerText = (c + 1).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);


                /*
                d = document.createElement('span');
                d.className = 'Digit';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (c) * this.zoomScale + 'px';
                d.style.top = (0) * this.zoomScale + 'px';
                d.innerText = (c + 1).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                AxisDigits.appendChild(d);

                 */


                for (let r = 0; r < this.row2d; r++) {
                    let d = document.createElement('span');
                    d.id = 'digit' + this.props.idComp + '-' + (r * this.col2d + c);
                    d.className = 'Digit';
                    d.style.width = this.zoomScale + 'px';
                    d.style.height = this.zoomScale + 'px';
                    d.style.left = (c) * this.zoomScale + 'px';
                    d.style.top = (this.row2d - r - 1) * this.zoomScale + 'px';
                    d.innerText = ''; //r * this.col2d + c;
                    d.style.fontSize = this.zoomScale / 3 + 'px';
                    d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                    digits.appendChild(d);
                }
            }
            for (let r = 0; r < this.row2d; r++) {
                let d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (- 1) * this.zoomScale + 'px';
                d.style.top = (this.row2d - r - 1) * this.zoomScale + 'px';
                d.innerText = (this.row2d - r).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);


                d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (this.col2d) * this.zoomScale + 'px';
                d.style.top = (this.row2d - r - 1) * this.zoomScale + 'px';
                d.innerText = (this.row2d - r).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);

            }
        } else {
            digits.className = 'Digits';
            digits.id = 'digits2d' + this.props.idComp;
            digits.style.width = this.row2d * this.zoomScale + 'px';
            digits.style.height = this.col2d * this.zoomScale + 'px';

            /*
            AxisDigits.className = 'AxisDigits';
            AxisDigits.id = 'AxisDigits2d' + this.props.idComp;
            AxisDigits.style.width = this.row2d * this.zoomScale + 'px';
            AxisDigits.style.height = 1 * this.zoomScale + 'px';

             */

            for (let r = 0; r < this.row2d; r++) {
                let d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (this.row2d - r - 1) * this.zoomScale + 'px';
                d.style.top = (this.col2d) * this.zoomScale + 'px';
                d.innerText = (this.row2d - r).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);

                d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (this.row2d - r - 1) * this.zoomScale + 'px';
                d.style.top = (-1) * this.zoomScale + 'px';
                d.innerText = (this.row2d - r).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);


                /*
                d = document.createElement('span');
                d.className = 'Digit';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (this.row2d - r - 1) * this.zoomScale + 'px';
                d.style.top = (0) * this.zoomScale + 'px';
                d.innerText = (r + 1).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                AxisDigits.appendChild(d);

                 */


                for (let c = 0; c < this.col2d; c++) {
                    let d = document.createElement('span');
                    d.id = 'digit' + this.props.idComp + '-' + (r * this.col2d + c);
                    d.className = 'Digit';
                    d.style.width = this.zoomScale + 'px';
                    d.style.height = this.zoomScale + 'px';
                    d.style.left = (this.row2d - r - 1) * this.zoomScale + 'px';
                    d.style.top = (this.col2d - c - 1) * this.zoomScale + 'px';
                    d.innerText = ''; //r * this.col2d + c;
                    d.style.fontSize = this.zoomScale / 3 + 'px';
                    d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                    digits.appendChild(d);
                }
            }

            for (let c = 0; c < this.col2d; c++) {
                let d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (- 1) * this.zoomScale + 'px';
                d.style.top = (this.col2d - c - 1) * this.zoomScale + 'px';
                d.innerText = (c + 1).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);

                d = document.createElement('span');
                d.className = 'DigitAxe';
                d.style.width = this.zoomScale + 'px';
                d.style.height = this.zoomScale + 'px';
                d.style.left = (this.row2d) * this.zoomScale + 'px';
                d.style.top = (this.col2d - c - 1) * this.zoomScale + 'px';
                d.innerText = (c + 1).toFixed(0); //r * this.col2d + c;
                d.style.fontSize = this.zoomScale / 3 + 'px';
                d.style.paddingTop = this.zoomScale / 3.75 + 'px';
                digits.appendChild(d);
            }

        }



        zoomWindow.appendChild(digits);
        //zoomAxis.appendChild(AxisDigits);

    }

    hideMap() {
        this.canvas.style.visibility = 'hidden';
    }

    showMap() {
        this.canvas.style.visibility = 'visible';
    }

    onResizeHandler() {
        this.setState({cog_opacity: 0});
        this.canvas.style.opacity = 0;
        window.setTimeout(this.onResize, 200);
        window.setTimeout(()=>{
            this.createDigits();
            if (this.lastData !== null) this.updateDigits(this.lastData);
        }, 300);
    }

    /* Creating WebGL Objects */
    createMap2D(col, row, cellsize) {
        this.removeWEBGL();
        if (window['renderer'+this.props.idComp] === undefined) {
            //console.log('Create');
            this.renderer2d = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
            window['renderer'+this.props.idComp] = this.renderer2d;
        } else {
            //console.log('Restore');
            this.renderer2d = window['renderer'+this.props.idComp];
        }
        //if (this.props.renderer2d === null) this.renderer2d = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer2d.setPixelRatio(2);

        let count = Math.round(1/cellsize);
        this.col2d = col;
        this.row2d = row;
        this.csize2d = cellsize;
        let cont = document.getElementById('contCanvas2d'+this.props.idComp);
        let canvas = this.renderer2d.domElement;
        this.canvas = canvas;
        this.canvas.style.visibility = 'hidden';
        cont.appendChild(canvas);


        if (this.props.zoom == true) {

            /*
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
            canvas.addEventListener('touchend', (e) => {
                //this.hideZoom();
            });

            canvas.addEventListener('touchmove', (e) => {
                this.onZoom(e);
            });
            */

            canvas.addEventListener('touchstart', this.preventDef);

            canvas.addEventListener('touchmove', this.onZoom);
        }


        this.scene2d = new THREE.Scene();
        let R  = new Uint8Array( 3 * col * row);
        for (let i=0; i < (col * row); i++) {
            let stride = i * 3;
            R[ stride ] = 0;
            R[ stride + 1 ] = 0;
            R[ stride + 2 ] = 0;
        }
        this.readingsT = new THREE.DataTexture( R, col, row, THREE.RGBFormat );
        this.readingsT.needsUpdate = true;

        if (this.colormapT == null) {
            let new2Dcolor = new Uint8Array(4 * 65536);
            for (let i = 0; i < 65536; i++) {
                let stride = i * 4;
                new2Dcolor[stride] = 0;
                new2Dcolor[stride + 1] = 0;
                new2Dcolor[stride + 2] = 0;
                new2Dcolor[stride + 3] = 0;
            }
            this.colormapT = new THREE.DataTexture(new2Dcolor, 256, 256, THREE.RGBAFormat);
            this.colormapT.needsUpdate = true;
        }



        let shaderCode = document.getElementById("fragShaderCubicBobyfitter").innerHTML;
        let vertexShaderCode = document.getElementById("vertexShaderPlane").innerHTML;
        this.geometry = new THREE.PlaneGeometry(col * 10, row * 10, 1, 1);

        let uniforms = {};
        uniforms.readings = {type: 't', value: this.readingsT};
        uniforms.colormap = {type: 't', value: this.colormapT};
        uniforms.col = {type: 'i', value: col};
        uniforms.row = {type: 'i', value: row};
        uniforms.isGrid = {type: 'i', value: window.settings.isGrid ? 1 : 0}



        this.material = new THREE.ShaderMaterial({uniforms:uniforms, vertexShader:vertexShaderCode, fragmentShader:shaderCode, side: THREE.DoubleSide, transparent: true});
        this.material.extensions.derivatives = true;

        this.obj2d = new THREE.Mesh(this.geometry, this.material);
        this.obj2d.position.x = Math.round(col * 10 / 2);
        this.obj2d.position.y = Math.round(row * 10 / 2);
        this.obj2d.position.z = 0;
        this.scene2d.add(this.obj2d);

        let mesh2d = null;
        if (1==1) {
            let k = 0;
            let mat = new THREE.LineBasicMaterial({color: 0xffffff});
            let points = new Float32Array((row+1+col+1)*6);
            for (let i=0; i<=row; i++) {
                points[k] = 0;
                points[k+1] = i*10;
                points[k+2] = 5;
                points[k+3] = 10*col;
                points[k+4] = i*10;
                points[k+5] = 5;
                k = k + 6;
            }
            for (let j=0; j<=col; j++) {
                points[k] = j*10;
                points[k+1] = 0;
                points[k+2] = 5;
                points[k+3] = j*10;
                points[k+4] = row*10;
                points[k+5] = 5;
                k = k + 6;
            }
            let geo = new THREE.BufferGeometry();
            geo.addAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );
            mesh2d = new THREE.LineSegments(geo, mat);
            this.scene2d.add(mesh2d);
        }
        if (this.props.portrait) {
            this.camera2d = new THREE.OrthographicCamera(-1, col*10+1, row*10+1, -1, 0, 10000);
            this.camera2d.rotation.z = 0;
        } else {
            this.camera2d = new THREE.OrthographicCamera(-row*10-1, 1, col*10+1, -1, 0, 10000);
            this.camera2d.rotation.z = - 90 * Math.PI / 180;
        }


        //this.camera2d = new THREE.OrthographicCamera(-1, col*10+1, row*10+1, -1, 0, 10000);
        //this.camera2d = new THREE.OrthographicCamera(-row*10-1, 1, col*10+1, -1, 0, 10000);
        //this.camera2d.rotation.z = - 90 * Math.PI / 180;

        this.camera2d.position.z = 2;
        this.renderer2d.render(this.scene2d, this.camera2d);



        window.addEventListener('resize', this.onResizeHandler, false);
        //window.addEventListener('orientationchange', ()=>{this.onResize(canvas)}, false);
        this.onResize();
        this.geometry.dispose();
        this.material.dispose();
        this.geometry = undefined;
        this.material = undefined;

        if (this.props.zoom == true) {
            let zoomWindow = document.getElementById('zoom2d'+this.props.idComp);
            zoomWindow.style.width = this.zoomWidth * this.zoomScale + 'px';
            zoomWindow.style.height = this.zoomHeight * this.zoomScale + 'px';

            if (window['rendererZoom'+this.props.idComp] === undefined) {
                //console.log('Create Zoom');
                this.renderZoom = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
                this.renderZoom.setClearColor(0x000000);
                window['rendererZoom'+this.props.idComp] = this.renderZoom;
            } else {
                //console.log('Restore Zoom');
                this.renderZoom = window['rendererZoom'+this.props.idComp];
            }
            this.renderZoom.setPixelRatio(2);
            zoomWindow.appendChild(this.renderZoom.domElement);

            let zoomCenter = document.getElementById('ZoomCenter'+this.props.idComp);
            let scale = 7;
            zoomCenter.style.width = this.zoomWidth * scale + 'px';
            zoomCenter.style.height = this.zoomHeight * scale + 'px';
            //zoomCenter.style.left = -51 - this.zoomWidth * scale/2 + 'px';
            zoomCenter.style.top = (this.zoomHeight * this.zoomScale / 2) - (this.zoomHeight * scale/2) -1 + 'px';
            zoomCenter.addEventListener('touchstart', this.preventDef);
            zoomCenter.addEventListener('touchmove', this.onZoom);

            /*

            let zoomHeader = document.getElementById('zoom2dHeader'+this.props.idComp);
            zoomHeader.style.width = this.zoomWidth * this.zoomScale + this.zoomScale + 'px';
            zoomHeader.style.height = 1 * this.zoomScale + 'px';

            let zoomAxis = document.getElementById('zoom2dAxis'+this.props.idComp);
            zoomAxis.style.width = this.zoomWidth * this.zoomScale + 'px';
            zoomAxis.style.height = 1 * this.zoomScale + 'px';

             */



            if (this.props.portrait) {
                this.cameraZoom = new THREE.OrthographicCamera(-1, this.zoomWidth*10+1, this.zoomHeight*10+1, -1, 0, 10000);
                this.cameraZoom.rotation.z = 0;
            } else {
                this.cameraZoom = new THREE.OrthographicCamera(-this.zoomWidth*10-1, 1, this.zoomHeight*10+1, -1, 0, 10000);
                this.cameraZoom.rotation.z = - 90 * Math.PI / 180;
            }

            this.cameraZoom.position.z = 6;

            this.renderZoom.setSize(this.zoomWidth * this.zoomScale, this.zoomHeight * this.zoomScale);
            this.renderZoom.render(this.scene2d, this.cameraZoom);


            this.createDigits();


        }


    }

    /* Clear Map2D */
    clearMap2D() {
        this.previousData = null;
        for (let i = 0; i < this.row2d; i++) {
            for (let j = 0; j < this.col2d; j++) {
                let stride = (i * this.col2d + j) * 3;
                this.readingsT.image.data[ stride ] = 0;
                this.readingsT.image.data[ stride + 1 ] = 0;
                this.readingsT.image.data[ stride + 2 ] = 0;
            }
        }
        this.readingsT.needsUpdate = true;


        this.renderer2d.render(this.scene2d, this.camera2d);
        if (this.state.zoomWindow) this.renderZoom.render(this.scene2d, this.cameraZoom);

        for (let i = 0; i < (this.col2d * this.row2d); i++) {
            document.getElementById('digit'+this.props.idComp+'-'+i).innerText = '';
        }
        this.lastData = null;
        this.setState({cog_opacity: 0});
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.enabled == false && nextProps.enabled == true) {
            window.setTimeout(()=>{this.onResize();}, 100);

        }

    }

    /* Resizing WebGL Objects when the window is resized. */
    onResize() {
        function getOffset(el) {
            let rect = el.getBoundingClientRect();
            return {
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY
            };
        }
        let obj = document.getElementById('cont2d'+this.props.idComp);
        if (obj) {
            //let w = obj.clientWidth;
            //let h = obj.clientHeight;
            let w = obj.offsetWidth;
            let h = obj.offsetHeight;
            //console.log('W: '+w+' H: '+h);
            let wD = 0;
            let hD = 0;
            if (w != this.w2d_cont || h != this.h2d_cont || 1==1) {
                this.w2d_cont = w;
                this.h2d_cont = h;
                let arD = 0.0;


                if (this.props.portrait) {
                    arD = this.col2d/this.row2d;
                    this.camera2d.rotation.z = 0;
                    this.camera2d.left = -1;
                    this.camera2d.right = this.col2d*10+1;
                    this.camera2d.top = this.row2d*10+1;
                    this.camera2d.bottom = -1;

                    if (this.cameraZoom) {
                        this.cameraZoom.left = -1;
                        this.cameraZoom.right = this.zoomWidth * 10 + 1;
                        this.cameraZoom.top = this.zoomHeight * 10 + 1;
                        this.cameraZoom.bottom = -1;
                        this.cameraZoom.rotation.z = 0;
                    }
                } else {
                    arD = this.row2d/this.col2d;
                    this.camera2d.rotation.z = - 90 * Math.PI / 180;
                    this.camera2d.left = -this.row2d*10-1;
                    this.camera2d.right = 1;
                    this.camera2d.top = this.col2d*10+1;
                    this.camera2d.bottom = -1;

                    if (this.cameraZoom) {
                        this.cameraZoom.left = -this.zoomWidth * 10 - 1;
                        this.cameraZoom.right = 1;
                        this.cameraZoom.top = this.zoomHeight * 10 + 1;
                        this.cameraZoom.bottom = -1;
                        this.cameraZoom.rotation.z = -90 * Math.PI / 180;
                    }
                }
                this.camera2d.updateProjectionMatrix();
                if (this.cameraZoom) this.cameraZoom.updateProjectionMatrix();

                let arS = w/h;
                if (arS>arD) {
                    hD = h;
                    wD = Math.round(arD * h);
                } else {
                    wD = w;
                    hD = Math.round(w / arD);
                }
                if (this.renderer2d !== undefined) {
                    this.renderer2d.setSize(wD, hD);
                    if (this.camera2d && this.renderer2d) this.renderer2d.render(this.scene2d, this.camera2d);
                    let left = Math.round((w / 2) - (wD / 2));
                    let top = Math.round((h / 2) - (hD / 2));
                    document.getElementById('contCanvas2d' + this.props.idComp).style.left = left + 'px';
                    document.getElementById('contCanvas2d' + this.props.idComp).style.top = top + 'px';
                }
            }

            //Offset
            this.offsetLeft = getOffset(this.canvas).left;
            this.offsetTop = getOffset(this.canvas).top;
            this.canvas.style.opacity = 1;


        }
    }

    normalize(p) {
        if (this.props.normalize) {
            let pNew = p - this.props.minimum;
            pNew = Math.round(pNew * (65535 / this.props.maximum));
            if (pNew < 0) pNew = 0;
            if (pNew > 65535) pNew = 65535;
            return pNew;
        } else {
            return p;
        }

    }

    renderMapT(value) {
        this.previousData = value;
        if (value.sensorSpecific.columns!=this.col2d || value.sensorSpecific.rows!=this.row2d) {
            this.createMap2D(value.sensorSpecific.columns, value.sensorSpecific.rows, this.csize2d);
            if (this.canvas !== null) window.setTimeout(()=>{this.showMap()}, 500);
        } else {
            for (let i = 0; i < this.row2d; i++) {
                for (let j = 0; j < this.col2d; j++) {
                    let stride = (i * this.col2d + j) * 3;
                    let pp = value.readings[i * this.col2d + j];
                    //pp = this.normalize(pp);
                    this.readingsT.image.data[ stride ] = Math.trunc(pp / 256);
                    this.readingsT.image.data[ stride + 1 ] = pp % 256;
                    this.readingsT.image.data[ stride + 2 ] = 0;
                }
            }
            this.readingsT.needsUpdate = true;


            this.renderer2d.render(this.scene2d, this.camera2d);
            if (this.state.zoomWindow) this.renderZoom.render(this.scene2d, this.cameraZoom);
        }
    }

    /* Creating Map2D texture from Data */
    renderMap(value, colorMap) {
        //console.log(this.props.colorMap);
        console.log(value);
        this.previousData = value;
        function inner(f00, f10, f01, f11, x, y) {
            let un_x = 1.0 - x; let un_y = 1.0 - y;
            return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
        }

        function cubic(p) {
            let a = [[0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]];

            a[0][0] = p[1][1];
            a[0][1] = -0.5 * p[1][0] + 0.5 * p[1][2];
            a[0][2] = p[1][0] - 2.5 * p[1][1] + 2 * p[1][2] - 0.5 * p[1][3];
            a[0][3] = -0.5 * p[1][0] + 1.5 * p[1][1] - 1.5 * p[1][2] + 0.5 * p[1][3];
            a[1][0] = -0.5 * p[0][1] + 0.5 * p[2][1];
            a[1][1] = 0.25 * p[0][0] - 0.25 * p[0][2] - 0.25 * p[2][0] + 0.25 * p[2][2];
            a[1][2] = -0.5 * p[0][0] + 1.25 * p[0][1] - p[0][2] + 0.25 * p[0][3] + 0.5 * p[2][0] - 1.25 * p[2][1] + p[2][2] - 0.25 * p[2][3];
            a[1][3] = 0.25 * p[0][0] - 0.75 * p[0][1] + 0.75 * p[0][2] - 0.25 * p[0][3] - 0.25 * p[2][0] + 0.75 * p[2][1] - 0.75 * p[2][2] + 0.25 * p[2][3];
            a[2][0] = p[0][1] - 2.5 * p[1][1] + 2 * p[2][1] - 0.5 * p[3][1];
            a[2][1] = -0.5 * p[0][0] + 0.5 * p[0][2] + 1.25 * p[1][0] - 1.25 * p[1][2] - p[2][0] + p[2][2] + 0.25 * p[3][0] - 0.25 * p[3][2];
            a[2][2] = p[0][0] - 2.5 * p[0][1] + 2 * p[0][2] - 0.5 * p[0][3] - 2.5 * p[1][0] + 6.25 * p[1][1] - 5 * p[1][2] + 1.25 * p[1][3] + 2 * p[2][0] - 5 * p[2][1] + 4 * p[2][2] - p[2][3] - 0.5 * p[3][0] + 1.25 * p[3][1] - p[3][2] + 0.25 * p[3][3];
            a[2][3] = -0.5 * p[0][0] + 1.5 * p[0][1] - 1.5 * p[0][2] + 0.5 * p[0][3] + 1.25 * p[1][0] - 3.75 * p[1][1] + 3.75 * p[1][2] - 1.25 * p[1][3] - p[2][0] + 3 * p[2][1] - 3 * p[2][2] + p[2][3] + 0.25 * p[3][0] - 0.75 * p[3][1] + 0.75 * p[3][2] - 0.25 * p[3][3];
            a[3][0] = -0.5 * p[0][1] + 1.5 * p[1][1] - 1.5 * p[2][1] + 0.5 * p[3][1];
            a[3][1] = 0.25 * p[0][0] - 0.25 * p[0][2] - 0.75 * p[1][0] + 0.75 * p[1][2] + 0.75 * p[2][0] - 0.75 * p[2][2] - 0.25 * p[3][0] + 0.25 * p[3][2];
            a[3][2] = -0.5 * p[0][0] + 1.25 * p[0][1] - p[0][2] + 0.25 * p[0][3] + 1.5 * p[1][0] - 3.75 * p[1][1] + 3 * p[1][2] - 0.75 * p[1][3] - 1.5 * p[2][0] + 3.75 * p[2][1] - 3 * p[2][2] + 0.75 * p[2][3] + 0.5 * p[3][0] - 1.25 * p[3][1] + p[3][2] - 0.25 * p[3][3];
            a[3][3] = 0.25 * p[0][0] - 0.75 * p[0][1] + 0.75 * p[0][2] - 0.25 * p[0][3] - 0.75 * p[1][0] + 2.25 * p[1][1] - 2.25 * p[1][2] + 0.75 * p[1][3] + 0.75 * p[2][0] - 2.25 * p[2][1] + 2.25 * p[2][2] - 0.75 * p[2][3] - 0.25 * p[3][0] + 0.75 * p[3][1] - 0.75 * p[3][2] + 0.25 * p[3][3];
            return a;
        }

        if (value.sensorSpecific.columns!=this.col2d || value.sensorSpecific.rows!=this.row2d) {
            this.createMap2D(value.sensorSpecific.columns, value.sensorSpecific.rows, this.csize2d);
        } else {

            if (window.interpolation == 'cubic') { // Cubic interpolation
                let raw = value.readings;
                let col = this.col2d;
                let row = this.row2d;
                let count = Math.round(1 / this.csize2d);
                let p = [[0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]];

                let shift = Math.round((count / 2) + (count / 2) * col * count);

                for (let x = 0; x < col-1; x++) {
                    for (let y = 0; y < row-1; y++) {

                        let fx = x;
                        let fy = y;
                        if (fx > col - 2) {fx = col - 2}
                        if (fy > row - 2) {fy = row - 2}

                        p[0][0] = raw[(fy == 0 ? 0 : (fy - 1)) * col + (fx == 0 ? 0 : (fx - 1))];
                        p[1][0] = raw[(fy == 0 ? 0 : (fy - 1)) * col + fx];
                        p[2][0] = raw[(fy == 0 ? 0 : (fy - 1)) * col + fx + 1];
                        p[3][0] = raw[(fy == 0 ? 0 : (fy - 1)) * col + (fx == (col - 2) ? (fx + 1) : (fx + 2))];

                        p[0][1] = raw[fy * col + (fx == 0 ? 0 : (fx - 1))];
                        p[1][1] = raw[fy * col + fx];
                        p[2][1] = raw[fy * col + fx + 1];
                        p[3][1] = raw[fy * col + (fx == (col - 2) ? (fx + 1) : (fx + 2))];

                        p[0][2] = raw[(fy + 1) * col + (fx == 0 ? 0 : (fx - 1))];
                        p[1][2] = raw[(fy + 1) * col + fx];
                        p[2][2] = raw[(fy + 1) * col + fx + 1];
                        p[3][2] = raw[(fy + 1) * col + (fx == (col - 2) ? (fx + 1) : (fx + 2))];

                        p[0][3] = raw[(fy == (row - 2) ? (fy + 1) : (fy + 2)) * col + (fx == 0 ? 0 : (fx - 1))];
                        p[1][3] = raw[(fy == (row - 2) ? (fy + 1) : (fy + 2)) * col + fx];
                        p[2][3] = raw[(fy == (row - 2) ? (fy + 1) : (fy + 2)) * col + fx + 1];
                        p[3][3] = raw[(fy == (row - 2) ? (fy + 1) : (fy + 2)) * col + (fx == (col - 2) ? (fx + 1) : (fx + 2))];

                        let a = cubic(p);



                        for (let xx = 0; xx < count; xx++) {
                            for (let yy = 0; yy < count; yy++) {
                                //let pp = Math.round(65535 * Math.random());

                                let dx = xx / count;
                                let dy = yy / count;
                                let x2 = dx * dx;
                                let x3 = x2 * dx;
                                let y2 = dy * dy;
                                let y3 = y2 * dy;

                                let pp = Math.round((a[0][0] + a[0][1] * dy + a[0][2] * y2 + a[0][3] * y3) +
                                    (a[1][0] + a[1][1] * dy + a[1][2] * y2 + a[1][3] * y3) * dx +
                                    (a[2][0] + a[2][1] * dy + a[2][2] * y2 + a[2][3] * y3) * x2 +
                                    (a[3][0] + a[3][1] * dy + a[3][2] * y2 + a[3][3] * y3) * x3);
                                if (pp < 0) {pp = 0}
                                if (pp > 65535) {pp = 65535}

                                //let stride = (i * col * count + j) * 4;
                                let stride = (y * col * count * count + yy * col * count + x * count + xx + shift) * 4;

                                if (colorMap === undefined) {
                                    this.texture2d.image.data[stride] = this.props.colorMap.color[pp][0];
                                    this.texture2d.image.data[stride + 1] = this.props.colorMap.color[pp][1];
                                    this.texture2d.image.data[stride + 2] = this.props.colorMap.color[pp][2];
                                    this.texture2d.image.data[stride + 3] = this.props.colorMap.color[pp][3];
                                } else {

                                    this.texture2d.image.data[stride] = colorMap.color[pp][0];
                                    this.texture2d.image.data[stride + 1] = colorMap.color[pp][1];
                                    this.texture2d.image.data[stride + 2] = colorMap.color[pp][2];
                                    this.texture2d.image.data[stride + 3] = colorMap.color[pp][3];
                                }

                            }
                        }



                    }
                }

                this.texture2d.needsUpdate = true;
                this.renderer2d.render(this.scene2d, this.camera2d);
                if (this.state.zoomWindow) this.renderZoom.render(this.scene2d, this.cameraZoom);

            } else { // Linear Interpolation
                let count = Math.round(1 / this.csize2d);
                let center = (count - 1) / 2;
                let x = 0;
                let y = 0;
                let raw = value.readings;
                let col = this.col2d;
                let row = this.row2d;
                let csize = this.csize2d;

                let p00 = 0.0;
                let p10 = 0.0;
                let p01 = 0.0;
                let p11 = 0.0;
                for (let i = 0; i < (row * count); i++) {
                    let currow = Math.floor(i / count);
                    let indrow = i - (currow * count);
                    let sty = (indrow * csize) + (csize / 2);
                    let dy = (csize * Math.floor(count / 2));
                    for (let j = 0; j < (col * count); j++) {

                        let curcol = Math.floor(j / count);
                        let indcol = j - (curcol * count);

                        let stx = (indcol * csize) + (csize / 2);
                        let dx = (csize * Math.floor(count / 2));

                        if (indcol <= center && indrow <= center) {
                            x = stx + dx;
                            y = sty + dy;

                            p00 = raw[(currow == 0 ? 0 : currow - 1) * col + (curcol == 0 ? 0 : curcol - 1)];
                            p10 = raw[(currow == 0 ? 0 : currow - 1) * col + curcol];
                            p01 = raw[currow * col + (curcol == 0 ? 0 : curcol - 1)];
                            p11 = raw[currow * col + curcol];
                        }
                        if (indcol > center && indrow <= center) {
                            x = stx - dx;
                            y = sty + dy;

                            p00 = raw[(currow == 0 ? 0 : currow - 1) * col + curcol];
                            p10 = raw[(currow == 0 ? 0 : currow - 1) * col + (curcol >= col - 1 ? curcol : curcol + 1)];
                            p01 = raw[currow * col + curcol];
                            p11 = raw[currow * col + (curcol >= col - 1 ? curcol : curcol + 1)];
                        }
                        if (indcol <= center && indrow > center) {
                            x = stx + dx;
                            y = sty - dy;
                            p00 = raw[currow * col + (curcol == 0 ? 0 : curcol - 1)];
                            p10 = raw[currow * col + curcol];
                            p01 = raw[(currow >= row - 1 ? currow : currow + 1) * col + (curcol == 0 ? 0 : curcol - 1)];
                            p11 = raw[(currow >= row - 1 ? currow : currow + 1) * col + curcol];
                        }
                        if (indcol > center && indrow > center) {
                            x = stx - dx;
                            y = sty - dy;
                            p00 = raw[currow * col + curcol];
                            p10 = raw[currow * col + (curcol >= col - 1 ? curcol : curcol + 1)];
                            p01 = raw[(currow >= row - 1 ? currow : currow + 1) * col + curcol];
                            p11 = raw[(currow >= row - 1 ? currow : currow + 1) * col + (curcol >= col - 1 ? curcol : curcol + 1)];
                        }

                        let p = inner(p00, p10, p01, p11, x, y);
                        let stride = (i * col * count + j) * 4;
                        let pp = Math.round(p);

                        //---Normalize---
                        pp = this.normalize(pp);
                        //^^^Normalize^^^
                        if (colorMap === undefined) {
                            this.texture2d.image.data[stride] = this.props.colorMap.color[pp][0];
                            this.texture2d.image.data[stride + 1] = this.props.colorMap.color[pp][1];
                            this.texture2d.image.data[stride + 2] = this.props.colorMap.color[pp][2];
                            this.texture2d.image.data[stride + 3] = this.props.colorMap.color[pp][3];
                        } else {
                            this.texture2d.image.data[stride] = colorMap.color[pp][0];
                            this.texture2d.image.data[stride + 1] = colorMap.color[pp][1];
                            this.texture2d.image.data[stride + 2] = colorMap.color[pp][2];
                            this.texture2d.image.data[stride + 3] = colorMap.color[pp][3];
                        }

                    }
                }
                this.texture2d.needsUpdate = true;
                this.renderer2d.render(this.scene2d, this.camera2d);
                if (this.state.zoomWindow) this.renderZoom.render(this.scene2d, this.cameraZoom);
            }
        }

        if (this.props.setStatistic) {this.props.setStatistic(value.sensorSpecific.statistics)}
        if (this.props.updateLabels) {this.props.updateLabels(value)}


    }

    updateDigits(value) {
        let coeff = 100/65535;
        if (value.sensorSpecific.conversion !== undefined) {
            coeff = value.sensorSpecific.conversion.value;
        }
        for (let i = 0; i < (this.col2d * this.row2d); i++) {
            let val = (value.readings[i] * coeff).toFixed(1);
            document.getElementById('digit'+this.props.idComp+'-'+i).innerText = val==0?'':val;
        }
        this.lastData = value;


        window.setTimeout(()=>{
            let massCenter = getMassCenter(value.readings, this.row2d, this.col2d);
            this.updateCog(massCenter.c, massCenter.r);
        }, 200);




    }

    /* Render Pressure Map from previous data */
    updateMap() {
        if (this.previousData!=null) {
            this.renderMap(this.previousData);
        }
    }

    render() {
        let classWrapper = '';
        let classInWrapper = '';
        if (this.state.shiftZoom) {
            if (this.ZoomPosition == 'left') {
                classWrapper = ' rotateRight';
                classInWrapper = ' rotateLeft';
            } else {
                classWrapper = ' rotateLeft';
                classInWrapper = ' rotateRight';
            }
        }
        return(
            <div style={{width: '100%', padding: '0', boxSizing: 'border-box'}}>
                <div style={{width: '100%', height: '100%', position: 'relative', textAlign: 'center'}} id={'cont2d'+this.props.idComp}>
                    <div style={{position: 'absolute'}} id={'contCanvas2d'+this.props.idComp}>

                        <div className={this.state.tempClass} style={(this.state.t1!='' && this.state.t2!='' && this.state.t3!='' && this.state.t4!='')?{opacity: 1}:{ opacity: 0}}>
                            <div className="TS TS1">
                                <span>{this.state.t1}</span>
                            </div>
                            <div className="TS TS2">
                                <span>{this.state.t2}</span>
                            </div>
                            <div className="TS TS3">
                                <span>{this.state.t3}</span>
                            </div>
                            <div className="TS TS4">
                                <span>{this.state.t4}</span>
                            </div>
                        </div>

                        <img
                            src="img/cog.png"
                            className="cog"
                            style={{
                                right: this.state.cog_right,
                                bottom: this.state.cog_bottom,
                                opacity: this.state.cog_opacity
                            }}

                        />
                    </div>
                    {/* averagePressureReduction */}
                    {this.props.averagePressureReduction !== undefined &&
                    <div
                        className={this.props.averagePressureReduction > 1 ? 'averagePressureReduction' : 'averagePressureReduction hidden'}
                        id="averagePressureReduction"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="#eeeeee" d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>
                        <span>{Math.round(this.props.averagePressureReduction)}% </span>
                    </div>
                    }
                </div>
                <div id={'wrapper'+this.props.idComp} className={'ZoomWrapper'+classWrapper} style={this.state.zoomWindow?{display: 'inline-block'}:{display: 'none'}}>
                    <div id={'inWrapper'+this.props.idComp} className={'ZoomInWrapper'+classInWrapper}>
                        <div id={'zoom2d'+this.props.idComp} className="Zoom" onClick={this.hideZoom}>
                        </div>
                        {/*
                        <div id={'zoom2dHeader'+this.props.idComp} className="ZoomHeader" style={this.state.zoomWindow?{display: 'block'}:{display: 'none'}}>
                            <div id={'zoom2dAxis'+this.props.idComp} className="ZoomAxis" >

                            </div>
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/><path d="M0 0h24v24H0z" fill="none"/>
                            </svg>

                        </div>
                        */}
                    </div>
                    <div
                        className="ZoomCenter"
                        id={'ZoomCenter'+this.props.idComp}
                        //onTouchMove={this.onZoom}
                        //onTouchStart={this.preventDef}
                    >
                    </div>
                </div>
            </div>
        );
    }
}

export default Map2D;