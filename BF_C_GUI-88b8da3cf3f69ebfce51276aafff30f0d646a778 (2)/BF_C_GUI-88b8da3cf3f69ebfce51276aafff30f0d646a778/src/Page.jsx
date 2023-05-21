import React from 'react';


class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return(
            <div className="Page">
                <div className="Head" id="Head">
                    {this.props.backButton!==undefined &&
                    <button
                        className="BackButton"
                        onClick={() => {
                            this.props.history.push(this.props.backButton);
                        }}
                        onTouchStart={() => {}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"/>
                            <path fill="none" d="M0 0h24v24H0z"/>
                        </svg>
                        <span>{window.loc.pageBackButton}</span>
                    </button>
                    }
                    {window.brand == 'BF' && <>
                    <img src="img/BodyfitterLogo.png" className="LogoBF" />
                    <img src="img/BodyfitterLogo_black.png" className="LogoBlackBF" />
                    </>}
                    {window.brand == 'MM' && <>
                        <img src="img/MundoMattress.png" className="LogoMM" />
                        <img src="img/MundoMattress_blue.svg" className="LogoBlackMM" />
                    </>}
                    {window.brand == 'VI' && <>
                        <img src="img/viasono.svg" className="LogoVI" />
                        <img src="img/viasono_blk.svg" className="LogoBlackVI" />
                    </>}
                    {window.brand == 'PU' && <>
                        <img src="img/Puritas_h.svg" className="LogoPU" />
                        <img src="img/Puritas_h_black.svg" className="LogoBlackPU" />
                    </>}
                </div>
                <div className={'Body '+this.props.class}>
                {this.props.children}
                </div>
            </div>
        );
    }
}

export default Page;