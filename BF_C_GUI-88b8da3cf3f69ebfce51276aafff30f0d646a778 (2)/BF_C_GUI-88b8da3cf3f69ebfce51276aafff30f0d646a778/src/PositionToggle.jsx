import React, {useState} from 'react';

//export default
function PositionToggleFunc(props) {

    return(
        <button className="PositionToggle" onClick={props.onChangePosition}>
            <div className={props.position=='back'?'El Left Active':'El Left'}>
                Back
            </div>
            <div className={props.position=='side'?'El Right Active':'El Right'}>
                Side
            </div>
        </button>
    );

}

class PositionToggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return(
            <button className="PositionToggle" onClick={this.props.onChangePosition}>
                <div className={this.props.position=='back'?'El Left Active':'El Left'}>
                    {window.loc.mainBackPos}
                </div>
                <div className={this.props.position=='side'?'El Right Active':'El Right'}>
                    {window.loc.mainSidePos}
                </div>
            </button>
        );
    }
}

export default PositionToggle;
