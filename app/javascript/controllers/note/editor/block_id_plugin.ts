// ripped from 
// https://discuss.prosemirror.net/t/how-i-can-attach-attribute-with-dynamic-value-when-new-paragraph-is-inserted/751/3

import {Plugin} from "prosemirror-state"
import {uuid} from "uuidv4"

export const createBlockIdPlugin = () => {
  return new Plugin({
    appendTransaction: (transactions, _prevState, nextState) => {
      console.log("block_id_plugin:appendTransaction")
      // start a transaction
      const transaction = nextState.tr

      let modified = false
      if (transactions.some((transaction) => transaction.docChanged)) {

        // strip block-id from non-top-level blocks
        nextState.doc.descendants((node, pos, parent) => {
          if (parent == nextState.doc) {
            // a top-level block

            // add block-id as needed
            if (
              !(node.type.name == 'h1') &&
              !node.attrs["block_id"]
            ) {
              // console.log('setting block_id for:')
              // console.log(node)

              transaction.setNodeMarkup(
                pos,
                undefined,
                {...(node.attrs), ["block_id"]: uuid()}
              )
              modified = true
            }

          } else {
            // not a top-level block

            // strip block-id as needed
            if (
              node.attrs["block_id"]
            ) {
              // console.log('stripping block_id')

              transaction.setNodeMarkup(
                pos,
                undefined,
                {...(node.attrs), ["block_id"]: null}
              )
              modified = true
            }

          }

        })
      }

      return modified ? transaction : null
    }
  })
}
