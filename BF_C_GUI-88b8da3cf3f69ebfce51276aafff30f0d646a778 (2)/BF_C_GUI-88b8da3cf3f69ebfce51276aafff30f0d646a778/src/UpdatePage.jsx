import React from 'react';
import Page from './Page.jsx';


class UpdatePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return(
            <Page class="UpdatePage">
                <div>
                    <h1>{window.loc.updateTitle}</h1>
                    {window.update == 'updateCore' &&
                    <h2>{window.loc.updateNeedUpdate}</h2>
                    }
                    {(window.update == 'updateGUI' || window.update == 'activation') &&
                    <h2>{window.loc.updateNeedRestart}</h2>
                    }

                    <button className="White"
                            onClick={() => {
                                if (window.update == 'updateCore') {updater.receiveUpdateConfirmation('Core');}
                                if (window.update == 'updateGUI' || window.update == 'activation') {updater.receiveUpdateConfirmation('GUI');}

                            }}
                            style={{marginTop: '5px', marginBottom: '50px'}}
                    >
                        {window.update == 'updateCore'?window.loc.updateUpdateButton:window.loc.updateRestartButton}
                    </button>
                </div>

            </Page>
        );
    }
}

export default UpdatePage;