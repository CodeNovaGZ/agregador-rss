import {proxy} from 'valtio/vanilla';
const state = proxy({
    form: {
        value: '',
        error: null,
        success: false,
    },
    feeds: [],
    posts: [],

})

export default state