import {proxy} from 'valtio/vanilla';
const state = proxy({
    form: {
        error: null,
        success: false,
    },
    feeds: [],
    posts: [],

})

export default state