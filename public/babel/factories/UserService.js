app.factory('UserService', [() => {
  var sdo = {
    isLogged: false,
    username: ''
  };
  return sdo;
}]);
