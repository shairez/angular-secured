angular.module("ngSecured")
.directive("asRole", ["ngSecured", "$animate",
                       function(ngSecured, $animate){
        return {
            transclude: "element",
            priority: 600,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function($scope, $element, $attrs, ctrl, $transclude){
                var block, childScope;
                $scope.$watch($attrs.asRole, function(newVal){

                    if (ngSecured.includeRole(newVal)){

                        if (!childScope){
                            childScope = $scope.$new();
                            $transclude(childScope, function(clone){
                                clone[clone.length++] = document.createComment(' end asRole: ' + $attrs.asRole + ' ');
                                block = {clone:clone};
                                $animate.enter(clone, $element.parent(), $element);
                            })
                        }
                    }else{
                        if (block){
                            $animate.leave(getBlockElements(block.clone));
                            block = null;
                        }
                        if (childScope){
                            childScope.$destroy();
                            childScope = null;
                        }
                    }


                })
            }
        }
    }])