(function (_window, _document, $, $U, $storage) {
  'use strict';

  $U('#add-user-btn').addEventListener('click', function () {
      var _userName = $U('#user-name').value;

      if(_userName) {
        var _users = $storage.get('users') || [];

        for(var i = 0, iL = _users.length, user = _users[i]; i < iL; i++) {
          if(user.name === _userName) {
            _window.toast('User already exists');
            return;
          }
        }

        _users.push({
          name: _userName,
          users: []
        })

        $storage.set('users', _users);

        $U('#add-new-user').classList.remove('open');

        renderUsers(_users);
      }
  });

  function renderUsers (users) {
    var _usersUl = $U('#user-container');
    _usersUl.innerHTML = '';

    users.forEach(function (user) {
      var _li = _document.createElement('li');
      _li.innerHTML = user.name;
      _usersUl.appendChild(_li);

      var _deleteButton = _document.createElement('button');
      _deleteButton.className = "btn btn-circle delete-user right";
      if(user.users.length !== 0) {
        _deleteButton.classList.add('disabled');
      }
      _deleteButton.innerHTML = '-';
      _deleteButton.setAttribute('data-delete-user', user.name);
      _deleteButton.addEventListener('click', function (event) {
        var _userName = event.target.getAttribute('data-delete-user');
        if(user.users.length === 0) {
          deleteUser(_userName);
        }
      })

      _li.appendChild(_deleteButton);
    })
  };

  function deleteUser (userName) {
    var _users = $storage.get('users');
    for(var i = 0, iL = _users.length; i < iL; i++) {
      var _user = _users[i];
      if(_user.name === userName) {
        _users.splice(i, 1);
        $storage.set('users', _users);
        renderUsers(_users);
        break;
      }
    }
  }

  renderUsers($storage.get('users') || [])

})(window, document, $, $U, Storage)
