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
                var block, childScope,
                    role;

                function getBlockElements(nodes) {
                    var startNode = nodes[0],
                        endNode = nodes[nodes.length - 1];
                    if (startNode === endNode) {
                        return angular.element(startNode);
                    }

                    var element = startNode;
                    var elements = [element];

                    do {
                        element = element.nextSibling;
                        if (!element) break;
                        elements.push(element);
                    } while (element !== endNode);

                    return angular.element(elements);
                }

                function invalidateDom(){
                    if (ngSecured.includesRole(role)){
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
                }

                // TODO: consider changing to $observe
                $scope.$watch(function(){return $attrs.asRole;}, function(newVal){
                    role = newVal;
                    invalidateDom();
                });
                $scope.$watch(function(){return ngSecured.getRoles();}, invalidateDom);
            }
        }
    }])