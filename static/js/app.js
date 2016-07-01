angular.module('csrApp', ['ngMaterial', 'ui.bootstrap', 'ngMessages'])
    .controller('formCtrl', function ($scope, $http, $uibModal, InventoryService, $location) {
        var inv = InventoryService;
        $scope.user = {
            name: '',
            email: '',
            number: '',
            food: [],
            drink: []
        };

        $scope.foods = inv.getFood();
        $scope.drinks = inv.getDrink();

        $scope.toggleMeal = function (food) {
            food.selected = !food.selected;
            food.qty = 1;
        };

        $scope.toggleDrink = function (drink) {
            drink.selected = !drink.selected;
            drink.qty = 1;
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
                if (element.selected) $scope.user.food.push(element);
            });

            $scope.drinks.forEach(function (element) {
                if (element.selected) $scope.user.drink.push(element);
            });

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myModalContent.html',
                controller: function ($scope, $uibModalInstance, items, $http, $location, $window) {
                    $scope.items = items.drink.concat(items.food);
                    $scope.contacts = {
                        name: items.name,
                        email: items.email,
                        phone: items.phone
                    };

                    $scope.total = 0;
                    $scope.items.forEach(function(element) {
                        $scope.total += element.price * element.qty;
                    }, this);

                    items.total = $scope.total;

                    $scope.ok = function (params) {
                        console.log(JSON.stringify(items));
                        var url = $location.absUrl() + 'submit';
 
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
                $scope.user.food = [];
                $scope.user.drink = [];
                console.log('Modal dismissed at: ' + new Date());
            });
        };

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