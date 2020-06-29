import { Schema, Node, DOMOutputSpec } from 'prosemirror-model'
import * as basicSchema from 'prosemirror-schema-basic'

import { tagNode } from './mention_plugin/tag_node'

const BLOCK_ID_ATTR = { default: '' }
const BLOCK_ID_ATTRS = { block_id: BLOCK_ID_ATTR }
function BLOCK_PARSE_DOM(tagName: string) {
  return [{
    tag: tagName,
    getAttrs: (dom) => ({block_id: dom.getAttribute("data-block-id")})
  }]
}
function BLOCK_TO_DOM_FUNC(tagName: string): (node: Node) => DOMOutputSpec {
  return function(node) {
    return [tagName, {"data-block-id": node.attrs.block_id}, 0]
  }
}

// we extend the pre-defined nodes with a block_id attribute
// spec https://prosemirror.net/docs/ref/#schema-basic
// base nodes https://github.com/prosemirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// list nodes https://github.com/prosemirror/prosemirror-schema-list/blob/master/src/schema-list.js
const nodes = {
  paragraph: {
    content: "inline*",
    group: "block",
    attrs: BLOCK_ID_ATTRS,
    parseDOM: BLOCK_PARSE_DOM("p"),
    toDOM: BLOCK_TO_DOM_FUNC("p"),
  },

  h1: {
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [{tag: 'h1'}],
    toDOM() { return ['h1', 0] },
  },

  text: {
    group: "inline"
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return ["br"] },
  },

  bullet_list: {
    content: "list_item+",
    group: "block",
    attrs: BLOCK_ID_ATTRS,
    parseDOM: BLOCK_PARSE_DOM("ul"),
    toDOM: BLOCK_TO_DOM_FUNC("ul"),
  },

  list_item: {
    content: "paragraph block*",
    parseDOM: [{tag: "li"}],
    toDOM() { return ["li", 0] },
    defining: true
  },

  tag: tagNode
}

export const noteSchema = new Schema({
  // TODO fix type error, I'm thinking the @types package is out of date
  nodes: {
    doc: {
      content: 'h1 block+',
    },
    paragraph: nodes.paragraph,
    // @ts-ignore
    h1: nodes.h1,
    text: nodes.text,
    // @ts-ignore
    hard_break: nodes.hard_break,
    bullet_list: nodes.bullet_list,
    // @ts-ignore
    list_item: nodes.list_item,
    // @ts-ignore
    tag: nodes.tag,
  },
  marks: basicSchema.schema.spec.marks
})
