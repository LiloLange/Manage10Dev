import React from 'react';
import Page from "./Page.jsx";
import Input from "./Input.jsx";


class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.onNext = this.onNext.bind(this);
        this.state = {
            name: '',
            phone: '',
            email: '',
        };
    }

    onNext() {
        if (window.export === null) window.export = Object();
        window.export.profile = Object();
        window.export.profile.name = this.state.name;
        window.export.profile.phone = this.state.phone;
        window.export.profile.email = this.state.email;
        if (window.settings.mode == 'default') this.props.history.push('/MainPage');
        if (window.settings.mode == 'duo') this.props.history.push('/MainPageDuo');
    }

    componentDidMount() {
        if (window.export !== null && window.export.profile !== undefined) {
            this.setState({
                name: window.export.profile.name,
                phone: window.export.profile.phone,
                email: window.export.profile.email,
            });
        }
    }



    render() {
        return(
            <Page class="Profile">
                <h1>{window.loc.profileTitle}</h1>

                <div className="FormWrapper">
                    <div className="Form">
                        <span>{window.loc.profileName}</span><br/>

                        <Input
                            value={this.state.name}
                            onChange={(v) => {
                                this.setState({name: v})
                            }}
                            error=""
                            width={'100%'}
                            type="text"
                            autoCapitalize="words"
                            onReturn={() => {this.refs.Phone.setFocus();}}
                        />


                        <span>{window.loc.profilePhone}</span><br/>
                        <Input
                            value={this.state.phone}
                            onChange={(v) => {
                                this.setState({phone: v})
                            }}
                            error=""
                            width={'100%'}
                            type="tel"
                            ref="Phone"
                            //autoCapitalize="words"
                            onReturn={() => {this.refs.Email.setFocus();}}
                        />



                        <span>{window.loc.profileEmail}</span><br/>
                        <Input
                            value={this.state.email}
                            onChange={(v) => {
                                this.setState({email: v})
                            }}
                            error=""
                            width={'100%'}
                            type="email"
                            ref="Email"
                            //onReturn={() => {this.refs.Phone.setFocus();}}
                        />
                    </div>
                </div>


                <div className="Buttons">
                    <button
                        className="White"
                        onClick={() => {
                            this.props.history.push('/');
                        }}
                    >
                        {window.loc.profilePrevButton}
                    </button>
                    <button
                        className="White"
                        onClick={this.onNext}
                    >
                        {window.loc.profileNextButton}
                    </button>
                </div>

            </Page>
        );
    }
}

export default Profile;