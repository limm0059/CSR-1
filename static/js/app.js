angular.module('csrApp', ['ngMaterial', 'ui.bootstrap', 'ngMessages'])
    .controller('formCtrl', function ($scope, $http, $uibModal, InventoryService) {
        var inv = InventoryService;

        $scope.user = {
            name: '',
            email: '',
            number: '',
            food: [],
            drink: []
        };

        $scope.submit = function () {
            // $http.post('somewebsite', body = JSON.stringify(body));

            console.log(JSON.stringify($scope.user));
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
                controller: function ($scope, $uibModalInstance, items, $http) {
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
                        console.log(items);
                        // var url = "url that will handle post json request.com";
                        // $http.post(url, JSON.stringify(items)).then(
                        //     function success(response) {
                        //         console.log("Success", response);
                        //     }, function error(response) {
                        //         console.log("Something went horribly wrong. Check url endpoint first");
                        //         alert("SHIT!");
                        //     }
                        // );
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
        }

        return list;
    });