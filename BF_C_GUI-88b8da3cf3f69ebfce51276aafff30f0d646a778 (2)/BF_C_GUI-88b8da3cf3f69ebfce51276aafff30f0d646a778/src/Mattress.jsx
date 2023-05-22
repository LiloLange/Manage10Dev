import React, {useState, useEffect} from "react";
import Map2D from "./Map2D.jsx";

//export default
function MattressFunc(props) {

    const [isZoom, setZoom] = useState(false);

    return (
        <div className="Mattress" id={'MattressID_'+ props.id}>
            <input className="MattressName"
                   value={props.mattressName}
                   onChange={(el) => {
                       props.onChangeMattressName(props.id, el.target.value);
                   }}
                   readOnly={props.readOnly || props.demoMode}
            />
            <div className="SelectLine"/>
            <div className="MapContentWrapper">
                <div className="Map2dWrapper" id={'Map2dWrapperID_' + props.id}>
                    <div className="Map2d"/>
                    <div className="Zoom"/>
                </div>
                <div className="Line"/>
                <div className="Stats">
                    <div className="Stat">
                        <div className="StatItem StatIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                                <path d="M0 0h24v24H0z" fill="none"/>
                            </svg>
                        </div>
                        <div className="StatItem StatName">Average Pressure:</div>
                        <div className="StatItem StatValue">88.8</div>
                        <div className="StatItem StatUnits">g/cm<sup>2</sup></div>
                    </div>
                    <div className="Stat">
                        <div className="StatItem StatIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                                <path d="M0 0h24v24H0z" fill="none"/>
                            </svg>
                        </div>
                        <div className="StatItem StatName">Surface Area:</div>
                        <div className="StatItem StatValue">8888</div>
                        <div className="StatItem StatUnits">cm<sup>2</sup></div>
                    </div>
                    <div className="Stat">
                        <div className="StatItem StatIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                                <path d="M0 0h24v24H0z" fill="none"/>
                            </svg>
                        </div>
                        <div className="StatItem StatName">Overpressure Area:</div>
                        <div className="StatItem StatValue">8.8</div>
                        <div className="StatItem StatUnits">cm<sup>2</sup></div>
                    </div>
                </div>
            </div>
        </div>
    );
}


class Mattress extends React.Component {
    constructor(props) {
        super(props);
        this.renderMap = this.renderMap.bind(this);
        this.clearMap = this.clearMap.bind(this);
        this.setStatistic = this.setStatistic.bind(this);
        this.hideZoom = this.hideZoom.bind(this);
        this.updateDigits = this.updateDigits.bind(this);
        this.renderToPNG = this.renderToPNG.bind(this);
        this.setColorMap = this.setColorMap.bind(this);
        this.updateCog = this.updateCog.bind(this);
        this.hideMap = this.hideMap.bind(this);
        this.showMap = this.showMap.bind(this);
        this.state = {
            avPres: '--',
            supAr: '--',
            overPress: '--',
            stdDeviation: '--',
        };

    }

    updateCog(col, row) {
        this.Map2d.updateCog(col, row);
    }

    renderMap(data) {
        //console.log(data);
        this.Map2d.renderMapT(data);
    }

    hideMap() {
        this.Map2d.hideMap();
    }

    showMap() {
        this.Map2d.showMap();
    }

    setColorMap(colormapT) {
        this.Map2d.setColorMap(colormapT);
    }

    renderToPNG() {
        return this.Map2d.renderToPNG();
    }

    updateDigits(data) {
        this.Map2d.updateDigits(data);
    }



    clearMap() {
        this.Map2d.clearMap2D();
        this.setState({
            avPres: '--',
            supAr: '--',
            overPress: '--',
        });
        this.Map2d.setState({
            t1: '',
            t2: '',
            t3: '',
            t4: '',
        });
    }

    hideZoom() {
        this.Map2d.hideZoom();
    }

    setStatistic(data) {
        this.setState({
            avPres: Number.parseFloat(data.sensorSpecific.statistics.averagePressure.value).toFixed(2),
            supAr: Number.parseFloat(data.sensorSpecific.statistics.surfaceArea.value).toFixed(0),
            overPress: Number.parseFloat(data.sensorSpecific.statistics.excessivePressureArea.value).toFixed(0),
        });
        if (data.sensorSpecific.tempData !== undefined && data.sensorSpecific.tempData.list !== undefined) {
            let cl = 'TempNone';
            if (data.sensorSerial.includes('BT2-2764-107-')) {
                cl = 'TempSensor1';
            }
            if (this.Map2d.state.tempClass != cl) {
                this.Map2d.setState({tempClass: cl});
            }

            this.Map2d.setState({
                t1: Number.parseFloat(data.sensorSpecific.tempData.list[0]).toFixed(0),
                t2: Number.parseFloat(data.sensorSpecific.tempData.list[1]).toFixed(0),
                t3: Number.parseFloat(data.sensorSpecific.tempData.list[2]).toFixed(0),
                t4: Number.parseFloat(data.sensorSpecific.tempData.list[3]).toFixed(0),
            });
        } else {
            if (this.Map2d.state.t1 != '') {
                this.Map2d.setState({
                    t1: '',
                    t2: '',
                    t3: '',
                    t4: '',
                });
            }
        }
        if (this.props.isStdDeviation === true && data.sensorSpecific.statistics.stdDeviation != undefined) {
            this.setState({
                stdDeviation: Number.parseFloat(data.sensorSpecific.statistics.stdDeviation.value).toFixed(2),
            });
        }
    }

    render() {
        return(
            <div className="Mattress" id={'MattressID_'+this.props.id}
                style={!this.props.enabled?{display: 'none'}:{width: this.props.matWidth}}
                onClick={()=>{this.props.onChangeMattress(this.props.id)}}
            >
                <input className="MattressName"
                       value={this.props.mattressName}
                       onChange={(el) => {
                           this.props.onChangeMattressName(this.props.id, el.target.value);
                       }}
                       //readOnly={this.props.readOnly || this.props.demoMode}
                />
                <div className={this.props.selectedMattress==this.props.id?'SelectLine Selected':'SelectLine'}></div>
                <div className="MapContentWrapper">
                    <div className="Map2dWrapper"
                         onClick={()=>{this.props.onChangeMattress(this.props.id)}}
                         onTouchMove={()=>{this.props.onChangeMattress(this.props.id)}}
                         onTouchStart={()=>{this.props.onChangeMattress(this.props.id)}}
                    >
                        {/*<div className="Map2d"/>*/}
                        <Map2D
                            idSensor={'s'+this.props.id}
                            idComp={'id'+this.props.id}
                            ref={instance => {
                                this.Map2d = instance;
                            }}
                            normalize={false}
                            zoom={true}
                            portrait={this.props.portrait}
                            enabled={this.props.enabled}
                            averagePressureReduction={this.props.averagePressureReduction}
                        />
                    </div>
                    <div className="Line"/>
                    <div className="Stats">
                        <div className="Stat">
                            <div className="StatItem StatIcon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.8 28.8" className="AvgPressure">
                                    <g id="Layer_2" data-name="Layer 2">
                                        <g id="Layer_1-2" data-name="Layer 1">
                                            <rect className="cls-1" width="28.8" height="28.8"/>
                                            <line className="cls-2" x1="14.4" y1="20.71" x2="14.4" y2="14.91"/>
                                            <line className="cls-2" x1="7.19" y1="14.81" x2="5.77" y2="13.39"/>
                                            <line className="cls-2" x1="21.65" y1="14.81" x2="23.07" y2="13.39"/>
                                            <line className="cls-2" x1="14.4" y1="11.43" x2="14.4" y2="9.42"/>
                                            <path d="M14.4,19.32a2,2,0,0,0-2,2h4A2,2,0,0,0,14.4,19.32Z"/>
                                            <path className="cls-2" d="M28,21.32v-.27a13.57,13.57,0,1,0-27.14,0v.27Z"/>
                                            <line className="cls-2" x1="24.23" y1="20.32" x2="26.24" y2="20.32"/>
                                            <line className="cls-2" x1="2.55" y1="20.32" x2="4.55" y2="20.32"/>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <div className="StatItem StatName">{window.loc.mainAvgPressure}:</div>
                            <div className="StatItem StatValue">{this.state.avPres}</div>
                            <div className="StatItem StatUnits">{window.settings.system=='metric'?window.loc.unitGCM2:window.loc.unitPSI} </div>
                        </div>
                        <div className="Stat">
                            <div className="StatItem StatIcon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.8 28.8" className="SurArea">
                                    <g id="Layer_2" data-name="Layer 2">
                                        <g id="Layer_1-2" data-name="Layer 1">
                                            <rect className="cls-1" width="28.8" height="28.8"/>
                                            <path
                                                d="M5.93,8.42H5.32V26.5a.6.6,0,0,0,.18.43.64.64,0,0,0,.43.18H24a.61.61,0,0,0,.62-.61V8.42A.61.61,0,0,0,24,7.8H5.93A.62.62,0,0,0,5.5,8a.67.67,0,0,0-.18.44h.61V9H24V8.42H23.4V26.5H24v-.62H5.93v.62h.62V8.42H5.93v0Z"/>
                                            <path d="M6.1,3.71H23.85a.54.54,0,1,0,0-1.07H6.1a.54.54,0,1,0,0,1.07"/>
                                            <path
                                                d="M8.11,4.32,6.89,3.17,8.11,2a.53.53,0,1,0-.73-.78h0L5.73,2.78a.52.52,0,0,0-.17.39.56.56,0,0,0,.17.4L7.38,5.1a.55.55,0,0,0,.76,0,.54.54,0,0,0,0-.76Z"/>
                                            <path
                                                d="M21.83,2l1.23,1.14L21.83,4.32a.54.54,0,0,0,0,.76.55.55,0,0,0,.76,0h0l1.65-1.53a.57.57,0,0,0,.18-.4.53.53,0,0,0-.18-.39L22.56,1.25a.53.53,0,1,0-.73.78Z"/>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <div className="StatItem StatName">{window.loc.mainSurfaceArea}:</div>
                            <div className="StatItem StatValue">{this.state.supAr}</div>
                            <div className="StatItem StatUnits">{window.settings.system=='metric'?window.loc.unitCM2:window.loc.unitIN2}</div>
                        </div>
                        <div className="Stat">
                            <div className="StatItem StatIcon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.8 28.8" className="MaxPressure">
                                    <g id="Layer_2" data-name="Layer 2">
                                        <g id="Layer_1-2" data-name="Layer 1">
                                            <rect className="cls-1" width="28.8" height="28.8"/>
                                            <line className="cls-2" x1="14.64" y1="20.32" x2="20.44" y2="20.32"/>
                                            <line className="cls-2" x1="7.19" y1="14.81" x2="5.77" y2="13.39"/>
                                            <line className="cls-2" x1="21.65" y1="14.81" x2="23.07" y2="13.39"/>
                                            <line className="cls-2" x1="14.4" y1="11.43" x2="14.4" y2="9.42"/>
                                            <path d="M14.4,19.32a2,2,0,0,0-2,2h4A2,2,0,0,0,14.4,19.32Z"/>
                                            <path className="cls-3" d="M28,21.32v-.27a13.57,13.57,0,1,0-27.14,0v.27Z"/>
                                            <line className="cls-2" x1="24.23" y1="20.32" x2="26.23" y2="20.32"/>
                                            <line className="cls-2" x1="2.55" y1="20.32" x2="4.56" y2="20.32"/>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <div className="StatItem StatName">{window.loc.mainOverpressureArea}:</div>
                            <div className="StatItem StatValue">{this.state.overPress}</div>
                            <div className="StatItem StatUnits">{window.settings.system=='metric'?window.loc.unitCM2:window.loc.unitIN2}</div>
                        </div>
                        {this.props.isStdDeviation === true &&
                        <div className="Stat">
                            <div className="StatItem StatIcon">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 2380.41 2379.45"
                                     className="StdDeviation"
                                >
                                    <g>
                                        <rect className="fil0" x="0.96" width="2379.45" height="2379.45"/>
                                        <line className="fil0 str0" x1="0.96" y1="1630.95" x2="2380.41" y2="1630.95"/>
                                        <path className="fil0 str0"
                                              d="M0.96 1630.95c323.94,-7.7 419.72,-104.8 567.59,-253.19 159.62,-160.19 240.71,-346.11 312.3,-518.89 79.31,-191.41 135.07,-390.87 306.81,-385.73 180.98,5.42 248.46,157.67 348.95,379.95 105.23,232.76 217.64,380 353.95,539.02 115.21,134.41 217.63,238.84 489.85,238.84"/>
                                        <line className="fil0 str0" x1="1187.67" y1="473.13" x2="1187.67" y2="1630.95"/>
                                        <line className="fil0 str0" x1="1560.34" y1="903.88" x2="1560.34" y2="1630.95"/>
                                    </g>
                                </svg>
                            </div>
                            <div className="StatItem StatName">{window.loc.mainStdDeviation}:</div>
                            <div className="StatItem StatValue">{this.state.stdDeviation}</div>
                            <div className="StatItem StatUnits">{window.settings.system=='metric'?window.loc.unitGCM2:window.loc.unitPSI} </div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }
}

export default Mattress;