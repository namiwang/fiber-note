// amended https://github.com/prosemirror/prosemirror-example-setup/blob/master/src/keymap.js

import { splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list"

import { noteSchema } from './schema'
import { toggleMark, chainCommands } from "prosemirror-commands"
import { splitListItemAndStripAttrs } from "./list_cmds"

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

let extraKeymap = {}

function bind(key, cmd) {
  extraKeymap[key] = cmd
}

// 
// inline: toggle marks
// 
let type
if (type = noteSchema.marks.strong) {
  bind("Mod-b", toggleMark(type))
  bind("Mod-B", toggleMark(type))
}
if (type = noteSchema.marks.em) {
  bind("Mod-i", toggleMark(type))
  bind("Mod-I", toggleMark(type))
}
// 
// TODO
// 
// if (type = schema.marks.code)
//   bind("Mod-`", toggleMark(type))

// 
// inline: hard break
// 
// TODO
if (type = noteSchema.nodes.hard_break) {
  let br = type, cmd = chainCommands((state, dispatch) => {
    dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
    return true
  })
  bind("Mod-Enter", cmd)
  bind("Shift-Enter", cmd)
  if (mac) bind("Ctrl-Enter", cmd)
}

// 
// list
// 
// TODO
// 
// bind("Enter", splitListItem(noteSchema.nodes.list_item))
bind("Enter", splitListItemAndStripAttrs(noteSchema.nodes.list_item))
bind("Mod-[", liftListItem(noteSchema.nodes.list_item))
bind("Mod-]", sinkListItem(noteSchema.nodes.list_item))
bind("Tab", sinkListItem(noteSchema.nodes.list_item))
bind("Shift-Tab", liftListItem(noteSchema.nodes.list_item))

// 
// history
// 
// bind("Mod-z", undo)
// bind("Shift-Mod-z", redo)
// bind("Backspace", undoInputRule)
// if (!mac) bind("Mod-y", redo)

// 
// misc
// 
// TODO
// 
// bind("Alt-ArrowUp", joinUp)
// bind("Alt-ArrowDown", joinDown)
// bind("Mod-BracketLeft", lift)
// bind("Escape", selectParentNode)

export { extraKeymap }
