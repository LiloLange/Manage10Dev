import React from 'react';

class Colorbar extends React.Component {
    constructor(props) {
        super(props);
        this.getScale = this.getScale.bind(this);
        this.state = {

        };
    }

    getScale() {
        let out = [];
        let n = 10;
        for (let i = 0; i < n; i++) {
            out.push(
                <div key={'DD-'+i}>
                    <div
                        className="Lines"
                        key={'LL-'+i}
                        style={{bottom: 100 * i / (n - 1) + '%'}}
                    />
                    <label
                        className="Values"
                        key={'VV-'+i}
                        style={{bottom: 100 * i / (n - 1) + '%'}}
                    >
                        {(((this.props.max - this.props.min) * i / (n - 1)) + this.props.min).toFixed(this.props.unit == 'psi' ? 2 : 1)}
                    </label>
                </div>
            );
        }


        return out;
    }

    render() {
        return(
            <div className={this.props.isScale?'Colorbar ColorBarWithScale':'Colorbar'}>
                <div className="ColorCont">
                    <img src="img/Color_Bar_sm.png" />
                    <label className="Low">{window.loc.mainLowLabel}</label>
                    <label className="Pressure">{window.loc.mainPressureLabel + (this.props.isScale ? ', '+ (this.props.unit == 'psi' ? 'PSI' : this.props.unit) : '')}</label>
                    <label className="High">{window.loc.mainHighLabel}</label>
                </div>
                {this.props.isScale &&
                    <div className="ScaleCont">
                        {this.getScale()}
                    </div>
                }

            </div>
        );
    }
}

export default Colorbar;