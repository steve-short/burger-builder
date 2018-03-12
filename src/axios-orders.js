import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-burger-builder-8a4dd.firebaseio.com'
});

export default instance;