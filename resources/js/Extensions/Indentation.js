import { Extension } from '@tiptap/core';

export const IndentationExtension = Extension.create({
    name: 'indentation',

    addGlobalAttributes() {
        return [
            {
                types: ['listItem', 'paragraph', 'heading'],
                attributes: {
                    indent: {
                        default: 0,
                        renderHTML: attributes => {
                            if (attributes.indent === 0) return {};
                            return { style: `margin-left: ${attributes.indent}px` };
                        },
                        parseHTML: element => element.style.marginLeft ? parseInt(element.style.marginLeft) : 0,
                    }
                }
            }
        ];
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                const { $from } = selection;

                if (state.schema.nodes.listItem) {
                    const listItem = $from.node($from.depth);
                    if (listItem && listItem.type.name === 'listItem') {
                        if (dispatch) {
                            try {
                            } catch (e) { }
                        }
                    }
                }

                return false;
            },
            outdent: () => ({ tr, state, dispatch }) => {
                return false;
            }
        }
    },

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                if (this.editor.can().sinkListItem('listItem')) {
                    return this.editor.commands.sinkListItem('listItem');
                }

                // Custom indent logic
                const { state, dispatch } = this.editor.view;
                const { selection } = state;
                const { $from } = selection;

                let targetNode = null;
                let targetPos = -1;

                // Try to find 'listItem' ancestor
                for (let d = $from.depth; d > 0; d--) {
                    const node = $from.node(d);
                    if (node.type.name === 'listItem') {
                        targetNode = node;
                        targetPos = $from.before(d);
                        break;
                    }
                }

                // Fallback to current node if not in a list
                if (!targetNode) {
                    targetNode = $from.node($from.depth);
                    targetPos = $from.before($from.depth);
                }

                // Apply indent
                if (targetNode && (['listItem', 'paragraph', 'heading'].includes(targetNode.type.name))) {
                    const currentIndent = targetNode.attrs.indent || 0;
                    const newIndent = Math.min(currentIndent + 20, 100); // Max 100px

                    if (dispatch) {
                        const tr = state.tr.setNodeMarkup(targetPos, null, { ...targetNode.attrs, indent: newIndent });
                        dispatch(tr);
                        return true;
                    }
                }

                return this.editor.commands.insertContent('\t');
            },
            'Shift-Tab': () => {
                if (this.editor.can().liftListItem('listItem')) {
                    return this.editor.commands.liftListItem('listItem');
                }

                const { state, dispatch } = this.editor.view;
                const { selection } = state;
                const { $from } = selection;

                let targetNode = null;
                let targetPos = -1;

                // Try to find 'listItem' ancestor
                for (let d = $from.depth; d > 0; d--) {
                    const node = $from.node(d);
                    if (node.type.name === 'listItem') {
                        targetNode = node;
                        targetPos = $from.before(d);
                        break;
                    }
                }

                if (!targetNode) {
                    targetNode = $from.node($from.depth);
                    targetPos = $from.before($from.depth);
                }

                // Apply dedent
                if (targetNode && (['listItem', 'paragraph', 'heading'].includes(targetNode.type.name))) {
                    const currentIndent = targetNode.attrs.indent || 0;
                    if (currentIndent > 0) {
                        const newIndent = Math.max(currentIndent - 20, 0);
                        if (dispatch) {
                            const tr = state.tr.setNodeMarkup(targetPos, null, { ...targetNode.attrs, indent: newIndent });
                            dispatch(tr);
                            return true;
                        }
                    }
                }
                return false;
            }
        };
    }
});
