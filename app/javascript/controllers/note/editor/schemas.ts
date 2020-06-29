import { Schema, Node, DOMOutputSpec } from 'prosemirror-model'
import * as basicSchema from 'prosemirror-schema-basic'

import { tagNode } from './mention_plugin/tag_node'

// we extend the pre-defined nodes with a block_id attribute
// spec https://prosemirror.net/docs/ref/#schema-basic
// base nodes https://github.com/prosemirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// list nodes https://github.com/prosemirror/prosemirror-schema-list/blob/master/src/schema-list.js
const nodes = {
  tag: tagNode,

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return ["br"] },
  },

  text: {
    group: "inline"
  },

  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] }
  },

  h1: {
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [{tag: 'h1'}],
    toDOM() { return ['h1', 0] },
  },

  list_item: {
    content: "paragraph block*",
    defining: true,
    attrs: { block_id: { default: '' } },
    parseDOM: [{
      tag: "li",
      getAttrs: (dom) => ({block_id: dom.getAttribute("data-block-id")})
    }],
    toDOM(node) {
      return ["li", {"data-block-id": node.attrs.block_id}, 0]
    }
  },

  bullet_list: {
    content: "list_item+",
    group: "block",
    parseDOM: [{tag: "ul"}],
    toDOM() { return ["ul", 0] },
  },
}

export const noteSchema = new Schema({
  // TODO fix type error, I'm thinking the @types package is out of date
  nodes: {
    doc: {
      content: 'h1 block+',
    },
    // @ts-ignore
    tag: nodes.tag,
    // @ts-ignore
    hard_break: nodes.hard_break,
    text: nodes.text,
    // @ts-ignore
    paragraph: nodes.paragraph,
    // @ts-ignore
    h1: nodes.h1,
    // @ts-ignore
    bullet_list: nodes.bullet_list,
    // @ts-ignore
    list_item: nodes.list_item,
  },
  marks: basicSchema.schema.spec.marks
})
