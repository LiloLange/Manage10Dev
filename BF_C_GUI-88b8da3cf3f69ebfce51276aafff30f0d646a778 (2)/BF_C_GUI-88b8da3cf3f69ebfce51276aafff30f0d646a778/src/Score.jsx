import React from 'react';
import CircularProgressbar from 'react-circular-progressbar';
import Odometer from 'react-odometerjs';


class Score extends React.Component {
    constructor(props) {
        super(props);
        this.minOf = this.minOf.bind(this);
        this.state = {
            score: 0,
            avPres: 0,
            supAr: 0,
            overPress: 0,
            minAvPres: 0,
            minSupAr: 0,
            minOverPress: 0,
        };
    }

    minOf(a, b) {
        if (a < b) {
            return a
        } else {
            return b
        }
    }

    componentDidMount() {
        window.setTimeout(() => {this.setState({score: this.props.score});}, 10);
        let minAvPres = 0;
        let minSupAr = 0;
        let minOverPress = 0;
        if (this.props.sensor.back !== null && this.props.sensor.side) {
            minAvPres = this.minOf(parseFloat(this.props.sensor.back.sensorSpecific.statistics.averagePressure.value), parseFloat(this.props.sensor.side.sensorSpecific.statistics.averagePressure.value));
            minSupAr = this.minOf(parseFloat(this.props.sensor.back.sensorSpecific.statistics.surfaceArea.value), parseFloat(this.props.sensor.side.sensorSpecific.statistics.surfaceArea.value));
            minOverPress = this.minOf(parseFloat(this.props.sensor.back.sensorSpecific.statistics.excessivePressureArea.value), parseFloat(this.props.sensor.side.sensorSpecific.statistics.excessivePressureArea.value));
        } else {
            if (this.props.sensor.back === null) {
                minAvPres = parseFloat(this.props.sensor.side.sensorSpecific.statistics.averagePressure.value);
                minSupAr = parseFloat(this.props.sensor.side.sensorSpecific.statistics.surfaceArea.value);
                minOverPress = parseFloat(this.props.sensor.side.sensorSpecific.statistics.excessivePressureArea.value);
            } else {
                minAvPres = parseFloat(this.props.sensor.back.sensorSpecific.statistics.averagePressure.value);
                minSupAr = parseFloat(this.props.sensor.back.sensorSpecific.statistics.surfaceArea.value);
                minOverPress = parseFloat(this.props.sensor.back.sensorSpecific.statistics.excessivePressureArea.value);
            }
        }


        this.setState({
            //avPres: (parseFloat(this.props.sensor.back.sensorSpecific.statistics.averagePressure.value) + parseFloat(this.props.sensor.side.sensorSpecific.statistics.averagePressure.value)) / 2,
            //supAr: (parseFloat(this.props.sensor.back.sensorSpecific.statistics.surfaceArea.value) + parseFloat(this.props.sensor.side.sensorSpecific.statistics.surfaceArea.value)) / 2,
            //overPress: (parseFloat(this.props.sensor.back.sensorSpecific.statistics.excessivePressureArea.value) + parseFloat(this.props.sensor.side.sensorSpecific.statistics.excessivePressureArea.value)) / 2,

            minAvPres: minAvPres,
            minSupAr: minSupAr,
            minOverPress: minOverPress,
        });
    }

    render() {
        let style={};
        //if (this.props.isMax) style={fontWeight: 'bold'};


        return (
            <div className="Score">
                <div className="title">
                    <h1>{this.props.mattressName}</h1>
                </div>
                <div className="Circle" style={style}>
                    <CircularProgressbar
                        percentage={this.state.score}
                        strokeWidth={5}
                        styles={{path: { stroke: this.props.isMax==true?'#E39F29':'#1DADEA', transition: 'stroke-dashoffset 2s ease 0s' }}}
                    />
                    <Odometer value={this.state.score} format="dd" />
                </div>
                <div className="Stats">
                    <p>{window.loc.mainAvgPressure}: {this.state.minAvPres.toFixed(1)} {window.settings.system=='metric'?window.loc.unitGCM2:window.loc.unitPSI}</p>
                    <p>{window.loc.mainSupportArea}: {this.state.minSupAr.toFixed(0)} {window.settings.system=='metric'?window.loc.unitCM2:window.loc.unitIN2}</p>
                    <p>{window.loc.mainOverpressureArea}: {this.state.minOverPress.toFixed(0)} {window.settings.system=='metric'?window.loc.unitCM2:window.loc.unitIN2}</p>
                </div>
            </div>
        );
    }
}

export default Score;