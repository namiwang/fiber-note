import { Controller } from 'stimulus'

import last from 'lodash/last'
import NoteEditorController from 'controllers/note_editor_controller'

export default class extends Controller {
  connect() {
    console.log('stimulus: notes--editor-wrapper connected on:')
    console.log(this.element)
  }

  click(event: Event) {
    if (event.target == this.element) { // on wrapper, not on any editor
      let downmostEditor = last(document.querySelectorAll('[data-controller=note-editor]'))
      let noteEditorController = this.application.getControllerForElementAndIdentifier(downmostEditor, 'note-editor') as NoteEditorController
      noteEditorController.focus()
    }
  }
}
