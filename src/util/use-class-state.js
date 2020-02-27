import { useState, useRef } from 'react';

const createSetClassState = (setState) => (updater) => {
    updater = typeof updater === 'function' ? updater : () => updater;

    return setState((state) => ({
        ...state,
        ...updater(state),
    }));
};

const useClassState = (initialState) => {
    const [state, setState] = useState(() => initialState ?? {});
    const setClassStateRef = useRef();

    if (!setClassStateRef.current) {
        setClassStateRef.current = createSetClassState(setState);
    }

    return [state, setClassStateRef.current];
};

export default useClassState;
