import OrderedMap from 'orderedmap'
import { Schema, NodeSpec } from 'prosemirror-model'
import * as basicSchema from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'

// spec
// https://prosemirror.net/docs/ref/#schema-basic
// https://github.com/prosemirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
let baseNodes = <OrderedMap<NodeSpec>>basicSchema.schema.spec.nodes
baseNodes = addListNodes(baseNodes, 'paragraph block*', 'block')

let nodes = OrderedMap.from(baseNodes)
// remove unsupported ones
nodes = nodes.remove('image')
nodes = nodes.remove('horizontal_rule')
nodes = nodes.remove('heading')
// enforce one h1 in the top of the note
nodes = nodes.append({
  h1: {
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [{tag: 'h1'}],
    toDOM() { return ['h1', 0] }
  }
})
nodes = nodes.update('doc', {
  content: 'h1 block+'
})
console.log(nodes)

export const schema = new Schema({
  nodes: nodes,
  marks: basicSchema.schema.spec.marks
})
