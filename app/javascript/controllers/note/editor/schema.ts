import OrderedMap from 'orderedmap'
import { Schema } from 'prosemirror-model'
import * as basicSchema from 'prosemirror-schema-basic'

const BLOCK_ID_ATTR = { default: '' }
const BLOCK_ID_ATTRS = { block_id: BLOCK_ID_ATTR }

// we extend the pre-defined nodes with a block_id attribute
// spec https://prosemirror.net/docs/ref/#schema-basic
// base nodes https://github.com/prosemirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// list nodes https://github.com/prosemirror/prosemirror-schema-list/blob/master/src/schema-list.js
const nodes = {
  doc: {
    // content: "block+"
    content: 'h1 block+'
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] },
    attrs: BLOCK_ID_ATTRS
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{tag: "blockquote"}],
    toDOM() { return ["blockquote", 0] },
    attrs: BLOCK_ID_ATTRS
  },

  // :: NodeSpec A horizontal rule (`<hr>`).
  horizontal_rule: {
    group: "block",
    parseDOM: [{tag: "hr"}],
    toDOM() { return ["hr"] },
    attrs: BLOCK_ID_ATTRS
  },

  // // :: NodeSpec A heading textblock, with a `level` attribute that
  // // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // // `<h6>` elements.
  // heading: {
  //   attrs: {level: {default: 1}},
  //   content: "inline*",
  //   group: "block",
  //   defining: true,
  //   parseDOM: [{tag: "h1", attrs: {level: 1}},
  //              {tag: "h2", attrs: {level: 2}},
  //              {tag: "h3", attrs: {level: 3}},
  //              {tag: "h4", attrs: {level: 4}},
  //              {tag: "h5", attrs: {level: 5}},
  //              {tag: "h6", attrs: {level: 6}}],
  //   toDOM(node) { return ["h" + node.attrs.level, 0] }
  // },
  // enforce one h1 in the top of the note
  h1: {
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [{tag: 'h1'}],
    toDOM() { return ['h1', 0] },
    attrs: BLOCK_ID_ATTRS
  },

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{tag: "pre", preserveWhitespace: "full"}],
    toDOM() { return ["pre", ["code", 0]] },
    attrs: BLOCK_ID_ATTRS
  },

  // :: NodeSpec The text node.
  text: {
    group: "inline"
  },

  // // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
  // // `alt`, and `href` attributes. The latter two default to the empty
  // // string.
  // image: {
  //   inline: true,
  //   attrs: {
  //     src: {},
  //     alt: {default: null},
  //     title: {default: null}
  //   },
  //   group: "inline",
  //   draggable: true,
  //   parseDOM: [{tag: "img[src]", getAttrs(dom) {
  //     return {
  //       src: dom.getAttribute("src"),
  //       title: dom.getAttribute("title"),
  //       alt: dom.getAttribute("alt")
  //     }
  //   }}],
  //   toDOM(node) { let {src, alt, title} = node.attrs; return ["img", {src, alt, title}] }
  // },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return ["br"] },
  },

  // :: NodeSpec
  // An ordered list [node spec](#model.NodeSpec). Has a single
  // attribute, `order`, which determines the number at which the list
  // starts counting, and defaults to 1. Represented as an `<ol>`
  // element.
  ordered_list: {
    content: "list_item+",
    group: "block",
    attrs: {
      order: {default: 1},
      block_id: BLOCK_ID_ATTR
    },
    parseDOM: [{tag: "ol", getAttrs(dom) {
      return {order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1}
    }}],
    toDOM(node) {
      return node.attrs.order == 1 ? ["ol", 0] : ["ol", {start: node.attrs.order}, 0]
    },
  },

  // :: NodeSpec
  // A bullet list node spec, represented in the DOM as `<ul>`.
  bullet_list: {
    content: "list_item+",
    group: "block",
    parseDOM: [{tag: "ul"}],
    toDOM() { return ["ul", 0] },
    attrs: BLOCK_ID_ATTRS
  },

  // :: NodeSpec
  // A list item (`<li>`) spec.
  list_item: {
    content: "paragraph block*",
    parseDOM: [{tag: "li"}],
    toDOM() { return ["li", 0] },
    defining: true
  },
}

console.log(nodes)

export const schema = new Schema({
  // TODO fix type error
  // @ts-ignore
  nodes: nodes,
  marks: basicSchema.schema.spec.marks
})
