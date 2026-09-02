import {proxy} from 'valtio/vanilla';
const state = proxy({
    form: {
        value: '',
        error: null,
    },
    feeds: [],
    posts: [],

})

export default state