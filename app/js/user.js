(function (_window, _document, $, $U, $storage) {
  'use strict';

  $U('#add-user-btn').addEventListener('click', function () {
      var _userName = $U('#user-name').value;
      var _groups = (function() {
        var _groupCheckboxes = _document.getElementsByName("groupName[]") || [];
        var _arr = [];
        for(var i = 0, iL = _groupCheckboxes.length; i < iL; i++) {
          if(_groupCheckboxes[i].checked)
            _arr.push(_groupCheckboxes[i].value);
        }
        return _arr;
      })()

      if(!_userName) {
        _window.toast("Enter a valid user name");
        return;
      }

      if(_groups.length === 0) {
        _window.toast("A user must be associated with atleast 1 group");
        return;
      }

      var _users = $storage.get('users') || [];

      for(var i = 0, iL = _users.length; i < iL; i++) {
        var _user = _users[i];
        if(_user.name === _userName) {
          _window.toast('User already exists');
          return;
        }
      }

      console.log(_groups)

      _users.push({
        name: _userName,
        groups: _groups
      })

      $storage.set('users', _users);

      $U('#add-new-user').classList.remove('open');

      renderUsers(_users);
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
      _deleteButton.innerHTML = '-';
      _deleteButton.setAttribute('data-delete-user', user.name);
      _deleteButton.addEventListener('click', function (event) {
        var _userName = event.target.getAttribute('data-delete-user');

        var _groups = $storage.get('groups') || [];

        for(var i = 0, iL = _groups.length; i < iL; i++) {
          var _group = _groups[i];
          var index;

          if((index = _group.users.indexOf(_userName)) > -1) {
            _group.users.splice(index, 1);
          }
        }

        $storage.set('groups', _groups);
        renderUsers();
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

  function populateGroups (groups) {
    for(var i = 0, iL = groups.length; i < iL; i++) {
      var _groupCheckbox = _document.createElement('input');
      _groupCheckbox.type = "checkbox";
      _groupCheckbox.name = "groupName[]";
      _groupCheckbox.value = groups[i].name;

      var _groupLabel = _document.createElement('label');
      _groupLabel.innerHTML = groups[i].name;

      var _groupContainer = _document.createElement('div');
      _groupContainer.appendChild(_groupCheckbox);
      _groupContainer.appendChild(_groupLabel);

      $U('#group-list').appendChild(_groupContainer);
    }
  }

  renderUsers($storage.get('users') || []);
  populateGroups($storage.get('groups') || []);

})(window, document, $, $U, Storage)
