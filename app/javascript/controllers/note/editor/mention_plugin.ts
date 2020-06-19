import {addMentionNodes, addTagNodes, getMentionsPlugin} from 'prosemirror-mentions'

/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */
var getMentionSuggestionsHTML = items => '<div class="suggestion-item-list">'+
  items.map(i => '<div class="suggestion-item">'+i.name+'</div>').join('')+
'</div>'

/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */
var getTagSuggestionsHTML = items => '<div class="suggestion-item-list">'+
  items.map(i => '<div class="suggestion-item">'+i.tag+'</div>').join('')+
'</div>'

export const mentionPlugin = getMentionsPlugin({
  getSuggestions: (type, text, done) => {
    setTimeout(() => {
      if (type === 'mention') {
        // pass dummy mention suggestions
        done([{name: 'John Doe', id: '101', email: 'joe@gmail.com'}, {name: 'Joe Lewis', id: '102', email: 'lewis@gmail.com'}])
      } else {
        // pass dummy tag suggestions
        done([{tag: 'WikiLeaks'}, {tag: 'NetNeutrality'}])
      }
    }, 0)
  },
  getSuggestionsHTML: (items, type) => {
    if (type === 'mention') {
      return getMentionSuggestionsHTML(items)
    } else if (type === 'tag') {
      return getTagSuggestionsHTML(items)
    }
  }
})
