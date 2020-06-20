// ripped and stripped from https://github.com/joelewis/prosemirror-mentions/

import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 *
 * @param {ResolvedPosition} $position https://prosemirror.net/docs/ref/#model.Resolved_Positions
 * @param {JSONObject} opts
 * @returns {JSONObject}
 */
function getMatch($position, opts) {
  // take current para text content upto cursor start.
  // this makes the regex simpler and parsing the matches easier.
  var parastart = $position.before();
  const text = $position.doc.textBetween(parastart, $position.pos, "\n", "\0");

  let regex = new RegExp("(^|\\s)" + opts.tagTrigger + "([\\w-\\+]+\\s?[\\w-\\+]*)$")

  let match = text.match(regex)

  // if match found, return match with useful information.
  if (match) {
    // adjust match.index to remove the matched extra space
    match.index = match[0].startsWith(" ") ? match.index + 1 : match.index;
    match[0] = match[0].startsWith(" ")
      ? match[0].substring(1, match[0].length)
      : match[0];

    // The absolute position of the match in the document
    var from = $position.start() + match.index;
    var to = from + match[0].length;

    var queryText = match[2];

    return {
      range: { from: from, to: to },
      queryText: queryText,
    };
  }
  // else if no match don't return anything.
}

/**
 * Util to debounce call to a function.
 * >>> debounce(function(){}, 1000, this)
 */
export const debounce = (function() {
  var timeoutId = null;
  return function(func, timeout, context) {
    context = context || this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function() {
      func.apply(context, arguments);
    }, timeout);

    return timeoutId;
  };
})();

var getNewState = function() {
  return {
    active: false,
    range: {
      from: 0,
      to: 0
    },
    text: "",
    suggestions: [],
    index: 0 // current active suggestion index
  };
};

/**
 * @param {JSONObject} opts
 * @returns {Plugin}
 */
export function getMentionsPlugin() {
  let opts = {
    tagTrigger: "#",
    getSuggestions: (text, done) => {
      setTimeout(() => {
        // pass dummy tag suggestions
        done([{tag: 'WikiLeaks'}, {tag: 'NetNeutrality'}])
      }, 0)
    },
    getSuggestionsHTML: (items) =>
      // outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
      // inner div's "suggestion-item" class is mandatory too for the same reasons
      `<div class="suggestion-item-list">
        ${
          items.map(i => '<div class="suggestion-item">'+i.tag+'</div>').join('')
        }
      </div>`
    ,
    activeClass: "suggestion-item-active",
    suggestionTextClass: "prosemirror-suggestion",
    delay: 500
  };

  // timeoutId for clearing debounced calls
  var showListTimeoutId = null;

  // dropdown element
  var el = document.createElement("div");

  // current Idx
  var index = 0;

  // ----- methods operating on above properties -----

  var showList = function(view, state, suggestions, opts) {
    el.innerHTML = opts.getSuggestionsHTML(suggestions);

    // attach new item event handlers
    el.querySelectorAll(".suggestion-item").forEach(function(itemNode, index) {
      itemNode.addEventListener("click", function() {
        select(view, state, opts);
        view.focus();
      });
      // TODO: setIndex() needlessly queries.
      // We already have the itemNode. SHOULD OPTIMIZE.
      itemNode.addEventListener("mouseover", function() {
        setIndex(index, state, opts);
      });
      itemNode.addEventListener("mouseout", function() {
        setIndex(index, state, opts);
      });
    });

    // highlight first element by default - like Facebook.
    addClassAtIndex(state.index, opts.activeClass);

    // get current @mention span left and top.
    // TODO: knock off domAtPos usage. It's not documented and is not officially a public API.
    // It's used currently, only to optimize the the query for textDOM
    var node = view.domAtPos(view.state.selection.$from.pos);
    var paraDOM = node.node;
    var textDOM = paraDOM.querySelector("." + opts.suggestionTextClass);

    // TODO: should add null check case for textDOM
    var offset = textDOM.getBoundingClientRect();

    // TODO: think about outsourcing this positioning logic as options
    document.body.appendChild(el);
    el.style.position = "fixed";
    el.style.left = offset.left + "px";

    var top = textDOM.offsetHeight + offset.top;
    el.style.top = top + "px";
    el.style.display = "block";
  };

  var hideList = function() {
    el.style.display = "none";
  };

  var removeClassAtIndex = function(index, className) {
    var itemList = el.querySelector(".suggestion-item-list").childNodes;
    var prevItem = itemList[index];
    prevItem.classList.remove(className);
  };

  var addClassAtIndex = function(index, className) {
    var itemList = el.querySelector(".suggestion-item-list").childNodes;
    var prevItem = itemList[index];
    prevItem.classList.add(className);
  };

  var setIndex = function(index, state, opts) {
    removeClassAtIndex(state.index, opts.activeClass);
    state.index = index;
    addClassAtIndex(state.index, opts.activeClass);
  };

  var goNext = function(view, state, opts) {
    removeClassAtIndex(state.index, opts.activeClass);
    state.index++;
    state.index = state.index === state.suggestions.length ? 0 : state.index;
    addClassAtIndex(state.index, opts.activeClass);
  };

  var goPrev = function(view, state, opts) {
    removeClassAtIndex(state.index, opts.activeClass);
    state.index--;
    state.index =
      state.index === -1 ? state.suggestions.length - 1 : state.index;
    addClassAtIndex(state.index, opts.activeClass);
  };

  var select = function(view, state, opts) {
    var item = state.suggestions[state.index];
    let attrs = {
      tag: item.tag
    }
    var node = view.state.schema.nodes['tag'].create(attrs);
    var tr = view.state.tr.replaceWith(state.range.from, state.range.to, node);

    var newState = view.state.apply(tr);
    view.updateState(newState);
  };

  /**
   * See https://prosemirror.net/docs/ref/#state.Plugin_System
   * for the plugin properties spec.
   */
  return new Plugin({
    key: new PluginKey("autosuggestions"),

    // we will need state to track if suggestion dropdown is currently active or not
    state: {
      init() {
        return getNewState();
      },

      apply(tr, state) {
        // compute state.active for current transaction and return
        var newState = getNewState();
        var selection = tr.selection;
        if (selection.from !== selection.to) {
          return newState;
        }

        const $position = selection.$from;
        const match = getMatch($position, opts);

        // if match found update state
        if (match) {
          newState.active = true;
          newState.range = match.range;
          newState.text = match.queryText;
        }

        return newState;
      }
    },

    // We'll need props to hi-jack keydown/keyup & enter events when suggestion dropdown
    // is active.
    props: {
      handleKeyDown(view, e) {
        var state = this.getState(view.state);

        // don't handle if no suggestions or not in active mode
        if (!state.active && !state.suggestions.length) {
          return false;
        }

        // if any of the below keys, override with custom handlers.
        var down, up, enter, esc;
        enter = e.keyCode === 13;
        down = e.keyCode === 40;
        up = e.keyCode === 38;
        esc = e.keyCode === 27;

        if (down) {
          goNext(view, state, opts);
          return true;
        } else if (up) {
          goPrev(view, state, opts);
          return true;
        } else if (enter) {
          select(view, state, opts);
          return true;
        } else if (esc) {
          clearTimeout(showListTimeoutId);
          hideList();
          this.state = getNewState();
          return true;
        } else {
          // didn't handle. handover to prosemirror for handling.
          return false;
        }
      },

      // to decorate the currently active @mention text in ui
      decorations(editorState) {
        const { active, range } = this.getState(editorState);

        if (!active) return null;

        return DecorationSet.create(editorState.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: "span",
            class: opts.suggestionTextClass
          })
        ]);
      }
    },

    // To track down state mutations and add dropdown reactions
    view() {
      return {
        update: view => {
          var state = this.key.getState(view.state);
          if (!state.text) {
            hideList();
            clearTimeout(showListTimeoutId);
            return;
          }
          // debounce the call to avoid multiple requests
          showListTimeoutId = debounce(
            function() {
              // get suggestions and set new state
              opts.getSuggestions(state.text, function(
                suggestions
              ) {
                // update `state` argument with suggestions
                state.suggestions = suggestions;
                showList(view, state, suggestions, opts);
              });
            },
            opts.delay,
            this
          );
        }
      };
    }
  });
}
