'use strict';

angular.module('ash.ng-sockets', ['ng'])
    .provider('$socket', function () {

        var webSocketServerUrl = null;

        this.setWebSocketServerUrl = function (url) {
            webSocketServerUrl = url;
        };

        this.$get = ['$rootScope', function ($rootScope) {
            if (!io) {
                return null;
            }

            var socket = webSocketServerUrl ? io(webSocketServerUrl) : io();

            function makeAngularCallback($scope, callback) {
                return function () {
                    var args = arguments;
                    $scope = $scope || $rootScope;

                    $scope.$apply(function () {
                        callback.apply(socket, args);
                    });
                };
            }

            return {
                on: function ($scope, eventName, callback) {
                    var ngCallback = makeAngularCallback($scope, callback);

                    $scope.$on('$destroy', function() {
                        socket.removeListener(eventName, ngCallback);
                    });

                    return socket.on(eventName, ngCallback);
                },
                once: function (eventName, callback) {
                    return socket.once(eventName, makeAngularCallback(null, callback));
                },
                emit: function () {
                    return socket.emit.apply(socket, arguments);
                },
                removeListener: function () {
                    return socket.removeListener.apply(socket, arguments);
                },
                removeAllListeners: function() {
                    return socket.removeAllListeners.apply(socket, arguments);
                }
            }
        }];

    });
