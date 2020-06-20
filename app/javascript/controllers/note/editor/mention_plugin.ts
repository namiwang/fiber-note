import {getMentionsPlugin} from './mention_plugin/mention_plugin'

export const mentionPlugin = getMentionsPlugin({
  getSuggestions: (text, done) => {
    setTimeout(() => {
      // pass dummy tag suggestions
      done([{tag: 'WikiLeaks'}, {tag: 'NetNeutrality'}])
    }, 0)
  },
  getSuggestionsHTML: (items) => {
    /**
     * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
     * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
     */
    return '<div class="suggestion-item-list">'+
      items.map(i => '<div class="suggestion-item">'+i.tag+'</div>').join('')+
    '</div>'
  }
})
