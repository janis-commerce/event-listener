# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2020-08-27
### Added
- GitHub Actions for build, coverage and publish

### Changed
- Updated `@janiscommerce/api` to `6.x.x`
- Updated `@janiscommerce/api-session` to `3.x.x`

## [2.0.0] - 2020-06-15
### Changed
- API upgraded to v5 (`api-session` validates locations) (**BREAKING CHANGE**)
- API Session upgraded to v2 (validates locations) (**BREAKING CHANGE**)

## [1.2.0] - 2020-05-19
### Removed
- `package-lock.json` file

## [1.1.1] - 2020-02-18
### Changed
- Dependencies updated

## [1.1.0] - 2019-11-12
### Added
- Disabled api logs for event listeners

### Changed
- Updated `@janiscommerce/api` package to `v4.2.0`

## [1.0.2] - 2019-10-30
### Fixed
- Removed side effect on sls-api-response dependency

## [1.0.1] - 2019-10-29
### Removed
- Unused endpoint handling

## [1.0.0] - 2019-10-18
### Added
- EventListener class to extend for your listeners
- ServerlessHandler to implement with AWS SLS lamba integration
- Event validation included
- Documentation in README
