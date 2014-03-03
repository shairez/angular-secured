angular-secured
================

Authentication &amp; Authorization for AngularJs

About
---
If you ever needed to handle Authentication (login, logout) in your application or manage state transition or view rendering according to the user's role or permissions (Authorization), this lib for you.

This library is built on top the angular-ui-router project, so you can control state transitions by the user's authorization configuration.


API
===


Sample Configuration
--------------------

```
angular.module("sampleApp").config(function($ngSecuredProvider) {

  $ngSecuredProvider.secure({
    loginState: "app.login"
    unAuthorizedState: "app.unAuthorized",
    login: function(credentials){
      return $http.post(credentials);
    }, 
    fetchingRoles: function(){
    },
    isAuthenticated: function(){
    }
    
  });

});

```


