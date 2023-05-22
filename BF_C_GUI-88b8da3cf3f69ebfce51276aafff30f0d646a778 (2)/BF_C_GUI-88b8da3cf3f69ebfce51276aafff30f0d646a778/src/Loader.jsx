import React from 'react';


class Loader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return(
            <div className="Loader">
                <div className="Square Sq1"></div>
                <div className="Square Sq2"></div>
                <div className="Square Sq3"></div>
            </div>
        );
    }
}

export default Loader;