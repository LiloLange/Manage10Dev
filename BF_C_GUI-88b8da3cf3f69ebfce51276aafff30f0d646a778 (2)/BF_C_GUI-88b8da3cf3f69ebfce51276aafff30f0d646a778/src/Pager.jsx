import React from 'react';


class Pager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }


    render() {
        let pages = [];
        for (let i=0; i<this.props.pages; i++) {
            pages.push(
                <div
                    key={i}
                    className={i==this.props.page?"Dot Active":"Dot"}
                    onClick={() => {
                        this.props.onChange(i);
                    }}
                />
            );
        }
        return(
            <div className="Pager"
                 //style={this.props.portrait?{visibility: 'visible'}:{visibility: 'hidden'}}
            >
                {pages}
            </div>
        );
    }
}

export default Pager;