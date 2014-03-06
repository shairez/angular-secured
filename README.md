angular-secured
================

Authentication &amp; Authorization for AngularJs

Copyright (C) 2014, Shai Reznik


About
---
If you ever needed to handle Authentication (login, logout) in your application or manage state transition or view rendering according to the user's role or permissions (Authorization), this lib for you.

This library is built on top the angular-ui-router project, so you can control state transitions by the user's authorization configuration, and uses angular-cache project for saving to localStorage by default.

Inspired by a good friend - Asaf David.


Naming Convention
---

When a function is about to return a promise, its name will end with "ing" to give a hint that you should expect a rpomise. 

For example: `ngSecured.loggingIn()`

API
===


Sample Configuration
--------------------

```js
angular.module("sampleApp").config(["$ngSecuredProvider", "ngSecured.cacheOptions", 
                                    function($ngSecuredProvider, cacheOptions) {

  $ngSecuredProvider.secure({
    loginState: "app.login",
    postLoginState: "app.afterLogin",
    postLogoutState: "home",
    unAuthorizedState: "app.unAuthorized",
    login: function(credentials){
      return $http.post(credentials);
    }, 
    fetchingRoles: function(rolesService){
      return rolesService.getRoles();
    },
    isAuthenticated: function(userService){
     return userService.isLoggedIn(); 
    },
    cache:{
      timeout: cacheOptions.timeout.FOREVER,
      location: cacheOptions.location.LOCAL_STORAGE
    }
    
    
  });

});

```


ngSecured API
===

loggingIn
---

pass this function the username/password you want to transfer forward to ngSecuredProvider.login(credentials)

```js

  ngSecured.loggingIn({username: "john", password: "1234"})

```


LICENSE
===
The MIT License (MIT)

Copyright (c) 2014 Shai Reznik

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
