# roam on rails

A roam-like networked note-taking app. open and self-hosting.

# screenshots

![screenshot](screenshots/v0.gif?raw=true "screenshot")

# demo

<a href="https://roam-on-rails-demo.herokuapp.com" target="_blank">A public demo</a>

> This public instance is deployed on a tiny heroku dyno and the performance has not been optimized for a lots-of-concurrent-user case.

# deployment

## heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

> The performance of an instance deployed on heroku is not ideal. Though, it should be enough for a single-user case. To boost performance, one should switch from actioncable to anycable.

## dependencies

- postgresql
- redis

## third party service

To enable performance analytics by skylight, set environment vars `SKYLIGHT_ENABLED=true` and `SKYLIGHT_AUTHENTICATION=YOUR_TOKEN`.

To enable sentry for error tracking, set environment var `SENTRY_DSN=YOUR_SENTRY_DSN`.
