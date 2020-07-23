![building](https://github.com/namiwang/fiber-note/workflows/test/badge.svg)
[![codecov](https://codecov.io/gh/namiwang/fiber-note/branch/master/graph/badge.svg)](https://codecov.io/gh/namiwang/fiber-note)

<a href="https://www.producthunt.com/posts/fiber-note?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-fiber-note" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=218238&theme=light" alt="fiber note - networked note-taking app, open and self-hosting | Product Hunt Embed" style="width: 125px; height: 27px;" width="125px" height="27px" /></a>

# fiber note

A networked note-taking app which is open and self-hosting, inspired by roam-research and others.

# screenshots

![screenshot](shed/screenshots/v0.optimized.gif?raw=true "screenshot")

# demo

<a href="https://fiber-note-demo.herokuapp.com/notes/welcome" target="_blank">A public demo</a>

# deployment

## dependencies

- typical rails environment, plus `postgresql` and `redis`.

## heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## environment variables

The app loads environment variables and behaves accordingly. It uses [dotenv](https://github.com/bkeepers/dotenv) to loads values from files (e.g. `.env`, `.env.development.local`, `.env.production`). Platforms like heroku also allow you to set env variables in the configuration panel.

### authentication

The app loads password from `ENV['PASSWORD']`, which is `password` by default, as defined in `.env`.

### available services

To enable performance analytics by skylight, set environment vars `SKYLIGHT_ENABLED=true` and `SKYLIGHT_AUTHENTICATION=YOUR_TOKEN`.

To enable sentry for error tracking, set an environment var `SENTRY_DSN=YOUR_SENTRY_DSN`.

## cookies

For security reasons (i.e. deploy this repo directly), `secret_key_base` will be randomized every time the server restarts, that includes upgrading to a new version. User may have to do a refresh in browser.
