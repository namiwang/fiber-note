# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

welcome_note = Block.create! is_note: true, title: 'welcome'
blocks = [
  {
    "type" => "list_item",
    "attrs" => {
      "block_id" => "d7b8599d-2da7-4f23-9628-7ceb95ee6f63", "hidden" => nil
    },
    "content" => [{
        "type" => "paragraph",
        "content" => [{
          "text" => "fiber note is a networked note-taking app",
          "type" => "text"
        }]
      },
      {
        "type" => "bullet_list",
        "content" => [{
          "type" => "list_item",
          "attrs" => {
            "block_id" => "58ff69ef-2e34-479e-8fea-8991be277f42", "hidden" => nil
          },
          "content" => [{
            "type" => "paragraph",
            "content" => [{
              "text" => "open-sourced and self-hosting",
              "type" => "text"
            }]
          }]
        }]
      }
    ]
  },
  {
    "type" => "list_item",
    "attrs" => {
      "block_id" => "4a69666f-fc19-4d31-9b0d-f6b083c8482c", "hidden" => nil
    },
    "content" => [{
        "type" => "paragraph",
        "content" => [{
          "type" => "tag",
          "attrs" => {
            "tag" => "usage"
          }
        }]
      },
      {
        "type" => "bullet_list",
        "content" => [{
            "type" => "list_item",
            "attrs" => {
              "block_id" => "59cc3385-c81c-49c9-b0ec-38cd416e31dc", "hidden" => nil
            },
            "content" => [{
              "type" => "paragraph",
              "content" => [{
                  "text" => "use # to input a ",
                  "type" => "text"
                },
                {
                  "type" => "tag",
                  "attrs" => {
                    "tag" => "tag"
                  }
                }
              ]
            }]
          },
          {
            "type" => "list_item",
            "attrs" => {
              "block_id" => "5023d745-be3d-44e4-8af7-d55a289c1536", "hidden" => nil
            },
            "content" => [{
              "type" => "paragraph",
              "content" => [{
                  "text" => "use ctrl/cmd-b to toggle ",
                  "type" => "text"
                },
                {
                  "text" => "strong",
                  "type" => "text",
                  "marks" => [{
                    "type" => "strong"
                  }]
                }
              ]
            }]
          },
          {
            "type" => "list_item",
            "attrs" => {
              "block_id" => "a4f6fc08-1b8b-48e2-b927-3543e3d31123", "hidden" => nil
            },
            "content" => [{
              "type" => "paragraph",
              "content" => [{
                  "text" => "use ctrl/cmd-i to toggle ",
                  "type" => "text"
                },
                {
                  "text" => "italics",
                  "type" => "text",
                  "marks" => [{
                    "type" => "em"
                  }]
                }
              ]
            }]
          }
        ]
      }
    ]
  },
  {
    "type" => "list_item",
    "attrs" => {
      "block_id" => "2874484d-695e-4a55-87a9-f67e26a87382", "hidden" => nil
    },
    "content" => [{
        "type" => "paragraph",
        "content" => [{
          "type" => "tag",
          "attrs" => {
            "tag" => "feedback"
          }
        }]
      },
      {
        "type" => "bullet_list",
        "content" => [{
          "type" => "list_item",
          "attrs" => {
            "block_id" => "2e1555fd-93a1-4f83-9a1f-dfefd965d7a9", "hidden" => nil
          },
          "content" => [{
            "type" => "paragraph",
            "content" => [{
              "text" => "https://github.com/namiwang/fiber-note/issues",
              "type" => "text"
            }]
          }]
        }]
      }
    ]
  },
  {
    "type" => "list_item",
    "attrs" => {
      "block_id" => "7e192d04-b27e-4c1d-9a3b-66acde5a49b3", "hidden" => nil
    },
    "content" => [{
        "type" => "paragraph",
        "content" => [{
          "type" => "tag",
          "attrs" => {
            "tag" => "roadmap"
          }
        }]
      },
      {
        "type" => "bullet_list",
        "content" => [{
          "type" => "list_item",
          "attrs" => {
            "block_id" => "b6b36cc2-3e65-416a-a36c-00501b473766", "hidden" => nil
          },
          "content" => [{
              "type" => "paragraph",
              "content" => [{
                "text" => "current iteration",
                "type" => "text"
              }]
            },
            {
              "type" => "bullet_list",
              "content" => [{
                  "type" => "list_item",
                  "attrs" => {
                    "block_id" => "0d9c77f1-7387-446e-ae91-cfe299fbdcb0",
                    "hidden" => nil
                  },
                  "content" => [{
                    "type" => "paragraph",
                    "content" => [{
                      "text" => "password protection",
                      "type" => "text"
                    }]
                  }]
                },
                {
                  "type" => "list_item",
                  "attrs" => {
                    "block_id" => "c0ca020d-86b3-4585-8d55-d1ab6f6a2bc7",
                    "hidden" => nil
                  },
                  "content" => [{
                    "type" => "paragraph",
                    "content" => [{
                      "text" => "more markdown syntax",
                      "type" => "text"
                    }]
                  }]
                },
                {
                  "type" => "list_item",
                  "attrs" => {
                    "block_id" => "c78ddb02-ebe8-4589-b82f-f722942882c5",
                    "hidden" => nil
                  },
                  "content" => [{
                    "type" => "paragraph",
                    "content" => [{
                      "text" => "bugs fixing around editor",
                      "type" => "text"
                    }]
                  }]
                }
              ]
            }
          ]
        }]
      }
    ]
  }
]
blocks.each do |block|
  Blocks::CreateOrUpdateService.new(block, welcome_note).perform!
end
welcome_note.update! child_block_ids: blocks.map{|b| b['attrs']['block_id'] }
