angular.module('csrApp', ['ngMaterial', 'ui.bootstrap', 'ngMessages'])
    .controller('formCtrl', function ($scope, $http, $uibModal, InventoryService, $location) {
        var inv = InventoryService;
        $scope.user = {
            name: '',
            email: '',
            phone: '',
            orders: []
        };

        console.log($location.absUrl());
        $scope.foods = inv.getFood();
        $scope.drinks = inv.getDrink();

        $scope.toggleOrder = function (item) {
            item.selected = !item.selected;
            item.qty = 1;
        };

        $scope.open = function (form) {

            // Comment this part out if you're testing and don't want validation
            if (!form.$valid) {
                console.log(form);
                var message = "There are invalid fields. ";
                alert(message);
                return;
            }

            $scope.foods.forEach(function (element) {
                if (element.selected) $scope.user.orders.push(element);
            });

            $scope.drinks.forEach(function (element) {
                if (element.selected) $scope.user.orders.push(element);
            });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: function ($scope, $uibModalInstance, items, $http, $location, $window) {
                    $scope.items = items.orders;
                    $scope.contacts = {
                        name: items.name,
                        email: items.email,
                        phone: items.phone
                    };

                    $scope.total = 0;
                    $scope.items.forEach(function (element) {
                        $scope.total += element.price * element.qty;
                    }, this);

                    items.total = $scope.total;

                    $scope.ok = function (params) {
                        console.log(JSON.stringify(items));
                        var url = $location.absUrl();

                        $http.post(url, JSON.stringify(items)).then(
                            function success(response) {
                                console.log("Success", response);
                                $window.location.href = $location.absUrl();
                            }, function error(response) {
                                console.log("Something went horribly wrong. Check url endpoint first");
                                alert("SHIT!");
                            }
                        );
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    items: function () {
                        return $scope.user;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $scope.user.orders = [];
                console.log('Modal dismissed at: ' + new Date());
            });
        };

    })
    .controller('indexCtrl', function ($location, $window, $scope, $http, $timeout, $uibModal) {
        $scope.toForm = function () {
            $window.location.href = $location.absUrl() + 'form';
        };
        $scope.phoneBox = {
            show: false,
            toggle: function () {
                this.show = !this.show;
            }
        };

        $scope.hideBall = true;

        var promise = null;
        $scope.$watch('phoneBox.phone', function (new_val, old_val) {
            
            if (promise) {
        	    $scope.hideBall = true;
            }
            $timeout.cancel(promise);
            if (!new_val) {
                return;
            }
            $scope.hideBall = false;            
            var url = $location.absUrl();
            var package = JSON.stringify({ phone: new_val });

            function getOrder() {
                $http.post(url, package).then(function success(response) {
                    $scope.items = response.data;
                    $scope.hideBall = true;
                    function open() {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'myModalContent.html',
                            controller: function ($scope, $uibModalInstance, items, $http, $location, $window) {
                                $scope.items = items.orders;
                                $scope.contacts = {
                                    name: items.name,
                                    email: items.email,
                                    phone: items.phone
                                };

                                $scope.total = 0;
                                $scope.items.forEach(function (element) {
                                    $scope.total += element.price * element.qty;
                                }, this);

                                items.total = $scope.total;

                                $scope.update = function () {
                                    $window.location.href = $location.absUrl() + 'form';
                                };
                                $scope.ok = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };
                            },
                            resolve: {
                                items: function () {
                                    return $scope.items;
                                }
                            }
                        });

                        modalInstance.result.then(function (selectedItem) {
                            $scope.selected = selectedItem;
                        }, function () {
                            console.log('Modal dismissed at: ' + new Date());
                        });
                    }
                    open();
                    
                }, function error(response) {
                    console.log('Error Data does not Exist');
                    $scope.hideBall = true;
                });
            }

            promise = $timeout(getOrder, 1500);
        });

    })
    .factory('InventoryService', function () {
        var list = {};

        var foods = [
            { category: 'Halal', name: 'Food 1', price: 10 },
            { category: 'Halal', name: 'Food 2', price: 12 },
            { category: 'Vegetarian', name: 'Food 3', price: 10 }
        ];

        foods.forEach(function (element) {
            element.selected = false;
            element.qty = 1;
        }, this);

        var drinks = [
            { name: "Kopi", price: 4 },
            { name: "Teh", price: 4 }
        ];

        drinks.forEach(function (element) {
            element.selected = false;
            element.qty = 1;
        });

        list.getFood = function () {
            return foods;
        };

        list.getDrink = function () {
            return drinks;
        };

        return list;
    });