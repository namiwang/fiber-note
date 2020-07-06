/**
 * See https://prosemirror.net/docs/ref/#model.NodeSpec
 */
export const tagNode = {
  group: "inline",
  inline: true,
  atom: true,

  attrs: {
    tag: ""
  },

  selectable: false,
  draggable: false,

  toDOM: node => {
    return [
      "a",
      {
        "data-tag": node.attrs.tag,
        class: "prosemirror-tag-node",
        href: `/notes/${node.attrs.tag}`
      },
      "#" + node.attrs.tag
    ]
  },

  parseDOM: [
    {
      // match tag with following CSS Selector
      tag: "a[data-tag]",

      getAttrs: dom => {
        let tag = dom.getAttribute("data-tag")
        return {
          tag: tag
        }
      }
    }
  ]
}
