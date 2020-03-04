import { isValidElement, cloneElement } from 'react';

const validateLayoutTree = (node) => {
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    if (!isValidElement(node)) {
        throw new TypeError('Only unary trees composed by react elements are supported as layouts');
    }

    if (node.props.children) {
        validateLayoutTree(node.props.children);
    }
};

const addPageToLayoutTree = (layoutNode, page) => cloneElement(layoutNode, {
    children: layoutNode.props.children ? addPageToLayoutTree(layoutNode.props.children, page) : page,
});

const createFullTree = (layoutTree, page) => {
    if (!layoutTree) {
        return page;
    }

    validateLayoutTree(layoutTree);

    return addPageToLayoutTree(layoutTree, page);
};

export default createFullTree;
