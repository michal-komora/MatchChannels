import { 
    SET_NAME, 
    EDIT_NAME, 
    EDIT_PRICE, 
    REGISTERED, 
    NEW_GAME, 
    CREATE_PEER,
    SET_CONNECTION,
    PICK_FIELDS
    } from '../constants/actionTypes';

import { createPeer } from '../services/webrtcService';
import { createUser, openChannel } from '../services/ethereumService';

import { browserHistory } from 'react-router';
import short from 'short-uuid';

import ethers from 'ethers';

export const newGame = (price) => (dispatch) => {
    dispatch({ type: NEW_GAME, payload: {price, session: createSession() } });

    browserHistory.push('/game');
};

export const setName = ({ target }) => (dispatch) => {

    dispatch({ type: SET_NAME, payload: createSession() });

    browserHistory.push('/game');
};

export const editName = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_NAME, payload: target.value });
};

export const editPrice = ({ target }) => (dispatch) => {
    console.log(target.value);

    dispatch({ type: EDIT_PRICE, payload: target.value });
};

export const register = ({ target }) => async (dispatch, getState) => {
    const state = getState();

    await createUser(state.user.userNameEdit, state.user.priceEdit);

    dispatch({ type: REGISTERED, payload: createSession() });

    browserHistory.push('/game');
};

export const initAccount = () => (dispatch) =>  {

    let peerId = localStorage.getItem('peer');

    if(!peerId) {
      peerId = short.uuid();
    
      localStorage.setItem('peer', peerId);
    }

    const peer = createPeer(peerId);

    dispatch({ type: CREATE_PEER, payload: {peer, peerId} });
};

export const setConnection = (connection) => (dispatch) => {

    const wallet = ethers.Wallet.createRandom();

    dispatch({ type: SET_CONNECTION, payload: {connection, wallet} });
};

export const pickFields = (channelId) => (dispatch) => {
    dispatch({ type: PICK_FIELDS, payload: channelId });

    browserHistory.push('/game');
};

function createSession() {

    const wallet = ethers.Wallet.createRandom();

    return {
        wallet
    };
}