# Scope
Re-do in JS of the [authn-node](https://github.com/keratin/authn-node) package
from Keratin.

# Background
I am using AuthN in another project and, while checking vulnerabilities for
dependencies with [Snyk](https://github.com/Snyk/) it reported several severe
ones in obsolete packages used by the original AuthN.

A quick upgrade of the AuthN dependencies did not work for me, so I decided to
update the code to get it working with the upgraded packages. But since I do
not know Typescrypt and do not have time to learn it now, I just re-wrote the 
AuthN package in JS, and re-wrote the tests to use [mocha](https://github.com/mochajs/mocha)
instead of [jest](https://github.com/jestjs/jest) (personal preference).

Functionality-wise. This package is identical to the original [authn-node](https://github.com/keratin/authn-node).
I might eventually extend it, if I need more functionality from [Authn-server](https://github.com/keratin/authn-server)
[API](https://keratin.github.io/authn-server/#/api) that is not supported by
authn-node.

# Installation

Npm:
> npm install @yaluba/authn-node

Yarn:
> yarn add @yaluba/authn-node

# Documentation

Documentation for AuthN server can be found [here](https://keratin.github.io/authn-server/).

The documentation for the original [@keratin/authn-node](https://github.com/keratin/authn-node)
applies.

The methods currently supported of the AuthN server API are:

| Authn API | Verb | Endpoint | Visibility | Authn-node method |
|-----------|:----:|----------|:----------:|-------------------|
| Get Account | GET | */accounts/:id* | Private | account |
| Update Account | PATCH / PUT | */accounts/:id* | Private | updateAccount |
| Archive Account | DELETE | */accounts/:id* | Private | archiveAccount |
| Import Account | POST | */accounts/import* | Private | importAccount |
| Lock Account | PATCH / PUT | */accounts/:id/lock* | Private | lockAccount |
| Unlock Account | PATCH / PUT | */accounts/:id/unlock* | Private | unlockAccount |
| Expire Password | PATCH / PUT | */accounts/:id/expire_password* | Private | expirePassword |
| - | - | - | - | subjectFrom |

***subjectFrom*** method that verifies validity of a passed JWT token and
returns its *subject* (sub) field.
