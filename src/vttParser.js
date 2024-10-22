/**
 * Adapted from:
 * https://github.com/plussub/srt-vtt-parser/blob/v1.1.0/src/vttParser.ts
 * 
 * Modifications:
 * - Convert TypeScript to JavaScript
 * - Inline isBlank and isEntryFromPartial functions
 * - Export vttParser function as default instead of named export
 * - Ignore cues without text instead of throwing an error.
 */

const isEntryFromPartial = (e) => {
    return typeof e.id === 'string' && typeof e.from === 'number' && typeof e.to === 'number' && typeof e.text === 'string';
};

const isBlank = (str) => !str || /^\s*$/.test(str);

const TRANSITION_NAMES = {
    HEADER: 'HEADER',
    ID: 'ID',
    TIME_LINE: 'TIME_LINE',
    ID_OR_NOTE_OR_STYLE: 'ID_OR_NOTE_OR_STYLE',
    STYLE: 'STYLE',
    NOTE: 'NOTE',
    TEXT: 'TEXT',
    MULTI_LINE_TEXT: 'MULTI_LINE_TEXT',
    FIN_ENTRY: 'FIN_ENTRY',
    FINISH: 'FINISH'
};

const timestampToMillisecond = (value) => {
    let arr = value.split(':');
    let hours, minutes, seconds;
    arr.length === 2 ? [minutes, seconds] = arr : [hours, minutes, seconds] = arr;
    return parseInt(seconds.replace('.', ''), 10) + parseInt(minutes, 10) * 60 * 1000 + (hours ? parseInt(hours, 10) : 0) * 60 * 60 * 1000;
};

const VttMachine = () => ({
    start(raw) {
        let currentTransition = TRANSITION_NAMES.HEADER;
        let params = {
            tokens: raw.split(/\n/),
            pos: 0,
            result: [],
            current: {}
        };
        while (currentTransition !== TRANSITION_NAMES.FINISH) {
            const result = this[currentTransition](params);
            params = result.params;
            currentTransition = result.next;
        }
        return params.result;
    },
    [TRANSITION_NAMES.HEADER](params) {
        return { next: TRANSITION_NAMES.ID_OR_NOTE_OR_STYLE, params: Object.assign(Object.assign({}, params), { pos: params.pos + 1 }) };
    },
    [TRANSITION_NAMES.ID_OR_NOTE_OR_STYLE](params) {
        const { tokens, pos } = params;
        if (tokens.length <= pos) {
            return { next: TRANSITION_NAMES.FINISH, params };
        }
        else if (isBlank(tokens[pos])) {
            return { next: TRANSITION_NAMES.ID_OR_NOTE_OR_STYLE, params: Object.assign(Object.assign({}, params), { pos: pos + 1 }) };
        }
        else if (tokens[pos].toUpperCase().includes('NOTE')) {
            return { next: TRANSITION_NAMES.NOTE, params };
        }
        else if (tokens[pos].toUpperCase().includes('STYLE')) {
            return { next: TRANSITION_NAMES.STYLE, params };
        }
        else {
            return { next: TRANSITION_NAMES.ID, params };
        }
    },
    [TRANSITION_NAMES.STYLE](params) {
        const { tokens, pos } = params;
        if (isBlank(tokens[pos])) {
            return { next: TRANSITION_NAMES.ID_OR_NOTE_OR_STYLE, params: Object.assign(Object.assign({}, params), { pos: pos + 1 }) };
        }
        return { next: TRANSITION_NAMES.STYLE, params: Object.assign(Object.assign({}, params), { pos: pos + 1 }) };
    },
    [TRANSITION_NAMES.NOTE](params) {
        const { tokens, pos } = params;
        if (isBlank(tokens[pos])) {
            return { next: TRANSITION_NAMES.ID_OR_NOTE_OR_STYLE, params: Object.assign(Object.assign({}, params), { pos: pos + 1 }) };
        }
        return { next: TRANSITION_NAMES.STYLE, params: Object.assign(Object.assign({}, params), { pos: pos + 1 }) };
    },
    [TRANSITION_NAMES.ID](params) {
        const { tokens, pos, current } = params;
        if (tokens.length <= pos) {
            return { next: TRANSITION_NAMES.FINISH, params };
        }
        if (isBlank(tokens[pos])) {
            return { next: TRANSITION_NAMES.ID, params: Object.assign(Object.assign({}, params), { pos: pos + 1 }) };
        }
        const idDoesNotExists = tokens[pos].includes('-->');
        current.id = idDoesNotExists ? '' : tokens[pos];
        return {
            next: TRANSITION_NAMES.TIME_LINE,
            params: Object.assign(Object.assign({}, params), { current,
                tokens, pos: idDoesNotExists ? pos : pos + 1 })
        };
    },
    [TRANSITION_NAMES.TIME_LINE](params) {
        const { tokens, pos, current } = params;
        const timeLine = tokens[pos];
        const [from, to] = timeLine.split('-->');
        current.from = timestampToMillisecond(from);
        current.to = timestampToMillisecond(to);
        return { next: TRANSITION_NAMES.TEXT, params: Object.assign(Object.assign({}, params), { current, pos: pos + 1 }) };
    },
    [TRANSITION_NAMES.TEXT](params) {
        const { tokens, pos, current } = params;
        if (tokens.length <= pos) {
            return { next: TRANSITION_NAMES.FINISH, params };
        }
        if (isBlank(tokens[pos])) {
            return { next: TRANSITION_NAMES.FIN_ENTRY, params };
        }
        current.text = tokens[pos];
        return { next: TRANSITION_NAMES.MULTI_LINE_TEXT, params: Object.assign(Object.assign({}, params), { current, pos: pos + 1 }) };
    },
    [TRANSITION_NAMES.MULTI_LINE_TEXT](params) {
        const { tokens, pos, current } = params;
        if (tokens.length <= pos) {
            return { next: TRANSITION_NAMES.FINISH, params };
        }
        if (isBlank(tokens[pos])) {
            return { next: TRANSITION_NAMES.FIN_ENTRY, params };
        }
        current.text = `${current.text}\n${tokens[pos]}`;
        return { next: TRANSITION_NAMES.MULTI_LINE_TEXT, params: Object.assign(Object.assign({}, params), { current, pos: pos + 1 }) };
    },
    [TRANSITION_NAMES.FIN_ENTRY](params) {
        const { pos, current, result } = params;
        if (isEntryFromPartial(current)) {
            result.push(current);
        }
        return { next: TRANSITION_NAMES.ID_OR_NOTE_OR_STYLE, params: Object.assign(Object.assign({}, params), { current: {}, pos: pos + 1 }) };
    },
    [TRANSITION_NAMES.FINISH](params) {
        return {
            next: TRANSITION_NAMES.FINISH,
            params
        };
    }
});

const vttParser = (raw) => {
    return {
        entries: VttMachine().start(raw)
    };
};

export default vttParser;