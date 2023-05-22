import React from 'react';


class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    setFocus() {
        this.refs.Input.focus();
    }

    componentDidMount() {

    }


    render() {
        return(
            <div className={this.props.className===undefined?"Input":this.props.className}
                 style={this.props.width===undefined?{}:{width: this.props.width}}>
                {this.props.label!==undefined && <label>{this.props.label}</label>}
                <input
                    ref="Input"
                    value={this.props.value}
                    onChange={(v) => {
                        this.props.onChange(v.target.value);
                    }}
                    className={this.props.error.length == 0?'normal':'error'}
                    type={this.props.type==undefined?"text":this.props.type}
                    onKeyUp={(ev) => {
                        if (ev.which == 13) {
                            if (this.props.onReturn) {
                                this.props.onReturn();
                            } else {
                                document.activeElement.blur();
                            }
                        }
                    }}

                    autoCapitalize={this.props.autoCapitalize==undefined?"none":this.props.autoCapitalize}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                />
                <span>{this.props.error}</span>

            </div>
        );
    }
}

export default Input;