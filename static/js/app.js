angular.module('csrApp', ['ngMaterial', 'ui.bootstrap', 'ngMessages', 'ngTable', 'bootstrapLightbox'])
    .controller('formCtrl', function ($scope, $http, $uibModal, InventoryService, $location, Lightbox) {
        $scope.intro = "Hello,\nWe are GIC interns raising funds for our CSR project. All proceeds will go to buying food supplies for our beneficiaries, residents in 1 room flats in XXXX neighborhood. Food and items will be available for collection at Level 38 on 13 July 2016, 11am till 3pm, payment only in cash, to be made then. (Exact change preferred.)";
		
		var inv = InventoryService;
        $scope.user = {
            name: '',
            email: '@gic.com.sg',
            phone: '',
            orders: []
        };

        $scope.test = function (args) {
            console.log(args);
        };
        $scope.foods = inv.getFoods();
        $scope.drinks = inv.getDrinks();
        $scope.gifts = inv.getGifts();

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

            var arrs = [$scope.foods, $scope.drinks, $scope.gifts];
            arrs.forEach(function (arr) {
                arr.forEach(function (e) {
                    if (e.selected) $scope.user.orders.push(e);
                });
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
                                alert("And you've helped save the world.. Thank you!");
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
        $scope.intro = "Hello,\nWe are GIC interns raising funds for our CSR project. All proceeds will go to buying food supplies for our beneficiaries, residents in 1 room flats in XXXX neighborhood. Food and items will be available for collection at Level 38 on 13 July 2016, 11am till 3pm, payment only in cash, to be made then. (Exact change preferred.)";
		
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
                    if (!response.data.orders) {
                        return;
                    }
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
    .controller('SummaryCtrl', function ($http, $scope, NgTableParams, $location) {

        $scope.tableParams1 = new NgTableParams();
        $scope.tableParams2 = new NgTableParams();

        $scope.aggregate = {
            total: 0,
            order: 0,
            unique: 0
        };

        $http.post($location.absUrl()).then(function success(response) {
            var data = response.data.ret;
            var agg = response.data.agg;

            $scope.aggregate.order = data.length;

            data.forEach(function (element, i) {
                var total = 0;
                element.orders.forEach(function (element) {
                    total += (element.qty * element.price);
                }, this);
                element.total = total;
                $scope.aggregate.unique += element.orders.length;
                $scope.aggregate.total += total;
            });
            $scope.tableParams1.settings({
                dataset: data
            });

            $scope.tableParams2.settings({
                dataset: agg
            });
        });
        $scope.url = $location.absUrl() + '/download';
    })
    .factory('InventoryService', function () {
        var list = {};

        var foods = [
            { name: 'Roasted Chicken Rice', description: 'Delicious Chicken Rice from Tian Tian @ Maxwell', price: 10, image: 'tiantianroast.jpg' },
            { name: 'White Chicken Rice', description: "Everyone's favourite Chicken Rice from Tian Tian @ Maxwell", price: 10, image: 'tiantianwhite.jpg' },
            { name: 'Ayam Mee Goreng', description: 'Halal: from Hajmeer Kwaja', price: 10, image: 'meegoreng.jpeg' },
            { name: 'Ayam Nasi Briyani', description: 'Halal: from Hajmeer Kwaja', price: 10, image: 'nasibriyanichicken.jpeg' },
            { name: 'Dry Prawn Noodle', description: " from Shu Shi", price: 10, image: 'prawnnoodle.jpeg' },
            { name: 'Laksa', description: " from Shu Shi", price: 10, image: 'laksa.jpeg' },
            { name: 'Vegetarian Large Set', description: "Vegetarian: from Shun Cheng Shu Shi", price: 10, image: 'vegetarian.jpg' },
            { name: 'Fish Porridge', description: " from Han Kee Fish Soup @ Amoy", price: 10, image: 'fishporridge.jpg' },
            { name: 'Fish Noodle', description: " from Han Kee Fish Soup @ Amoy", price: 10, image: 'hankeenoodle.jpeg' },
        ];

        var drinks = [
            { name: "Kopi", price: 4, description: "Aromatic and delicious", image: 'kopi.png' },
            { name: "Teh", price: 4, description: "The best money can buy", image: 'teh.jpg' }
        ];

        var gifts = [
            { name: "Sunflower", description: "Single Stalk", price: 5, image: 'chocolate.jpg' },
            { name: "Ritter Sport Chocolate", description: "100g assorted flavours", price: 5, image: 'sunflower.jpg' },
            { name: "Sunflower and Chocolate", description: "Combined gift option", price: 8, image: 'sunchoc.jpg' }
        ];

        [foods, drinks, gifts].forEach(function (arr) {
            arr.forEach(function (e) {
                e.selected = false;
                e.qty = 1;
            });
        });

        list.getFoods = function () {
            return foods;
        };

        list.getDrinks = function () {
            return drinks;
        };

        list.getGifts = function () {
            return gifts;
        };

        return list;
    });