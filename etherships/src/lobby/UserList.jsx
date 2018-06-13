import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getOpenChannels } from '../services/ethereumService';
import { connectPlayer } from '../services/webrtcService';

import ChallengeModal from '../modals/ChallengeModal';

import { setConnection, pickFields } from '../actions/userActions';

import './UserList.css';

class UserList extends Component {

    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            users: [],
            username: "",
            channelId: -1
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    async componentDidMount() {
        const users = await getOpenChannels();

        console.log(this.props.user.peer);

        if (this.props.user.peer) {
            this.props.user.peer.on('connection', (_conn) => {
                this.props.setConnection(_conn);
        
                _conn.on('data', (res) => {
                    console.log(res);

                    if (res.type === 'challenge') {

                        this.setState({
                            username: res.username,
                            channelId: res.channelId
                        });

                        this.openModal();
                    }
                });
              });

            
        }

        this.setState({
            users
        });
    }

    challengeOpponent = (user) => {
        console.log(user);

        const connection = connectPlayer(this.props.user.peer, user.webrtcId);

        connection.on('open', () => {
            this.props.setConnection(connection);

            connection.send({type: 'challenge', channelId: user.channelId.valueOf(), username: this.props.user.userName});

            connection.on('data', (res) => {
                if (res.type === 'accepted') {
                    this.props.pickFields(res.channelId);
                }
            });
        });
    }

    render() {
        return (
                <div>
                    <ChallengeModal 
                        modalIsOpen={ this.state.modalIsOpen } 
                        username={this.state.username} 
                        channelId={this.state.channelId} 
                        closeModal={ this.closeModal }
                    />
                    <div className="user-list">
                        <div className="user-list-header">
                            choose opponent player
                        </div>

                        <div className="user-list-body">

                            {
                                this.state.users.map( u => 
                                    <div className="user-list-item" key={u.args.channelId.valueOf()}>
                                        <span className='user-list-id'>#{u.args.channelId.valueOf()}</span>
                                        <span className='user-list-name'> {u.args.username} </span>
                                        <button className='user-list-btn' onClick={() => this.challengeOpponent(u.args)}>Battle ({window.web3.fromWei(u.args.amount.valueOf(), 'ether')} ETH)</button>
                                    </div>)
                            }

                        </div>
                    </div>
                </div>
        )
    }

}

const mapStateToProps = (props) => ({
    user: props.user,
});

const mapDispatchToProps = {
    setConnection,
    pickFields,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);