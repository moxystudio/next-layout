import { useState, useRef } from 'react';

const createSetObjectState = (setState) => (newState) => {
    const updater = typeof newState === 'function' ? newState : () => newState;

    return setState((state) => ({
        ...state,
        ...updater(state),
    }));
};

const useObjectState = (initialState) => {
    const [state, setState] = useState(() => initialState ?? {});
    const setObjectStateRef = useRef();

    if (!setObjectStateRef.current) {
        setObjectStateRef.current = createSetObjectState(setState);
    }

    return [state, setObjectStateRef.current];
};

export default useObjectState;
