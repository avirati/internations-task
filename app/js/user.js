(function (_window, _document, $, $U, $storage) {
  'use strict';

  $U('#add-user-btn').addEventListener('click', function () {
      var _userName = $U('#user-name').value;
      var _groups = (function() {
        var _groupCheckboxes = _document.getElementsByName("addUserGroupNames[]") || [];
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
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      for(var i = 0, iL = _users.length; i < iL; i++) {
        var _user = _users[i];
        if(_user.name === _userName) {
          _window.toast('User already exists');
          return;
        }
      }

      _users.push({
        name: _userName,
      })

      _usersGroups[_userName] = _groups;

      _groups.forEach(function (_group) {
        _groupsUsers[_group] = _groupsUsers[_group] || [];
        _groupsUsers[_group].push(_userName);
      })


      $storage.set('users', _users);
      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      $U('#add-new-user').classList.remove('open');

      renderUsers(_users);
  });

  function renderUsers (users) {
    var _usersUl = $U('#user-container');
    _usersUl.innerHTML = '';

    users.forEach(function (user) {
      var _li = _document.createElement('li');
      _li.innerHTML = user.name;
      _li.setAttribute('data-modal-target', 'view-user');
      _li.setAttribute('data-view-user', user.name);
      _li.addEventListener('click', function (event) {
        var _userName = event.target.getAttribute('data-view-user');
        showUser(_userName);
      })
      _usersUl.appendChild(_li);

      var _deleteButton = _document.createElement('button');
      _deleteButton.className = "btn btn-circle delete-user right";
      _deleteButton.innerHTML = '-';
      _deleteButton.setAttribute('data-delete-user', user.name);
      _deleteButton.addEventListener('click', function (event) {
        event.stopPropagation();
        var _userName = event.target.getAttribute('data-delete-user');

        deleteUser(_userName)
      })

      _li.appendChild(_deleteButton);
    })
    _window.initModals();
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

    var _usersGroups = $storage.get('usersGroups') || {};
    var _groupsUsers = $storage.get('groupsUsers') || {};

    var groupsAssociated = _usersGroups[userName];
    delete _usersGroups[userName];

    groupsAssociated.forEach(function (_group) {
      _groupsUsers[_group].splice(_groupsUsers[_group].indexOf(userName), 1);
    })

    $storage.set('usersGroups', _usersGroups);
    $storage.set('groupsUsers', _groupsUsers);

    renderUsers($storage.get('users') || []);
  }

  function populateGroups (groups, container, groupName) {
    for(var i = 0, iL = groups.length; i < iL; i++) {
      var _groupCheckbox = _document.createElement('input');
      _groupCheckbox.type = "checkbox";
      _groupCheckbox.name = groupName;
      _groupCheckbox.value = groups[i].name;

      var _groupLabel = _document.createElement('label');
      _groupLabel.innerHTML = groups[i].name;

      var _groupContainer = _document.createElement('div');
      _groupContainer.appendChild(_groupCheckbox);
      _groupContainer.appendChild(_groupLabel);

      $U(container).appendChild(_groupContainer);
    }
  }

  function showUser (userName) {
    $U('#save-user-name').value = userName;
    var _groupCheckboxes = _document.getElementsByName("viewUserGroupNames[]") || [];

    var _usersGroups = $storage.get('usersGroups');
    var _associatedGroups = _usersGroups[userName];

    for(var i = 0, iL = _groupCheckboxes.length; i < iL; i++) {
      _groupCheckboxes[i].checked = _associatedGroups.indexOf(_groupCheckboxes[i].value) > -1;
    }
  }

  renderUsers($storage.get('users') || []);
  populateGroups($storage.get('groups') || [], '#adduser-group-list', 'addUserGroupNames[]');
  populateGroups($storage.get('groups') || [], '#viewuser-group-list', 'viewUserGroupNames[]');
  _window.initModals();

})(window, document, $, $U, Storage)
