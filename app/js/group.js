(function (_window, _document, $, $U, $storage) {
  'use strict';

  $U('#add-group-btn').addEventListener('click', function () {
      var _groupName = $U('#group-name').value;
      var _users = (function() {
        var _userCheckboxes = _document.getElementsByName("addGroupUserNames[]") || [];
        var _arr = [];
        for(var i = 0, iL = _userCheckboxes.length; i < iL; i++) {
          if(_userCheckboxes[i].checked)
            _arr.push(_userCheckboxes[i].value);
        }
        return _arr;
      })();

      if(!_groupName) {
        _window.toast("Enter a valid user name");
        return;
      }

      var _groups = $storage.get('groups') || [];
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      for(var i = 0, iL = _groups.length; i < iL; i++) {
        var _group = _groups[i];
        if(_group.name === _groupName) {
          _window.toast('Group already exists');
          return;
        }
      }

      _groups.push({
        name: _groupName,
      })

      _groupsUsers[_groupName] = _users;

      _users.forEach(function (_user) {
        _usersGroups[_user] = _usersGroups[_user] || [];
        _usersGroups[_user].push(_groupName);
      })


      $storage.set('groups', _groups);
      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      $U('#add-new-group').classList.remove('open');

      renderGroups(_groups);
  });

  $U('#save-group-btn').addEventListener('click', function () {
      var _groupName = $U('#save-group-name').value;
      var _selectedUsers = (function() {
        var _userCheckboxes = _document.getElementsByName("viewGroupUserNames[]") || [];
        var _arr = [];
        for(var i = 0, iL = _userCheckboxes.length; i < iL; i++) {
          if(_userCheckboxes[i].checked)
            _arr.push(_userCheckboxes[i].value);
        }
        return _arr;
      })()

      if(!_groupName) {
        _window.toast("Enter a valid group name");
        return;
      }

      var users = $storage.get('users') || [];
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      _groupsUsers[_groupName] = _selectedUsers;

      users.forEach(function (_user) {
        if(_selectedUsers.indexOf(_user.name) > -1) {
            if(_usersGroups[_user.name].indexOf(_groupName) === -1) {
              _usersGroups[_user.name].push(_groupName);
            }
        }
        else {
          _usersGroups[_user.name].splice(_usersGroups[_user.name].indexOf(_groupName));
        }
      })

      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      $U('#view-group').classList.remove('open');
  });

  function renderGroups (groups) {
    var _groupsUl = $U('#group-container');
    _groupsUl.innerHTML = '';

    var groupsUsers = $storage.get('groupsUsers') || {};

    groups.forEach(function (group) {
      var _li = _document.createElement('li');
      _li.innerHTML = group.name;
      _li.setAttribute('data-modal-target', 'view-group');
      _li.setAttribute('data-view-group', group.name);
      _li.addEventListener('click', function (event) {
        var _groupName = event.target.getAttribute('data-view-group');
        showGroup(_groupName);
      })
      _groupsUl.appendChild(_li);

      var _deleteButton = _document.createElement('button');
      _deleteButton.className = "btn btn-circle delete-group right";
      if(groupsUsers[group.name].length !== 0) {
        _deleteButton.classList.add('disabled');
      }
      _deleteButton.innerHTML = '-';
      _deleteButton.setAttribute('data-delete-group', group.name);
      _deleteButton.addEventListener('click', function (event) {
        event.stopPropagation();
        var _groupName = event.target.getAttribute('data-delete-group');
        if(groupsUsers[group.name].length === 0) {
          deleteGroup(_groupName);
        }
        else {
          _window.toast("Can not delete a group which has users in it.")
        }
      })

      _li.appendChild(_deleteButton);
    })
    _window.initModals();
  };

  function deleteGroup (groupName) {
    var _groups = $storage.get('groups');
    for(var i = 0, iL = _groups.length; i < iL; i++) {
      var _group = _groups[i];
      if(_group.name === groupName) {
        _groups.splice(i, 1);
        $storage.set('groups', _groups);
        renderGroups(_groups);
        break;
      }
    }

    var _usersGroups = $storage.get('usersGroups') || {};
    var _groupsUsers = $storage.get('groupsUsers') || {};

    var usersAssociated = _groupsUsers[groupName];
    delete _groupsUsers[groupName];

    usersAssociated.forEach(function (_user) {
      _usersGroups[_user].splice(_usersGroups[_user].indexOf(groupName), 1);
    })

    $storage.set('usersGroups', _usersGroups);
    $storage.set('groupsUsers', _groupsUsers);

    renderUsers($storage.get('groups') || []);
  }

  function populateUsers (users, container, userName) {
    for(var i = 0, iL = users.length; i < iL; i++) {
      var _userCheckbox = _document.createElement('input');
      _userCheckbox.type = "checkbox";
      _userCheckbox.name = userName;
      _userCheckbox.value = users[i].name;

      var _userLabel = _document.createElement('label');
      _userLabel.innerHTML = users[i].name;

      var _userContainer = _document.createElement('div');
      _userContainer.appendChild(_userCheckbox);
      _userContainer.appendChild(_userLabel);

      $U(container).appendChild(_userContainer);
    }
  }

  function showGroup (groupName) {
    $U('#save-group-name').value = groupName;
    var _userCheckboxes = _document.getElementsByName("viewGroupUserNames[]") || [];

    var _groupsUsers = $storage.get('groupsUsers');
    var _associatedUsers = _groupsUsers[groupName];

    for(var i = 0, iL = _userCheckboxes.length; i < iL; i++) {
      _userCheckboxes[i].checked = _associatedUsers.indexOf(_userCheckboxes[i].value) > -1;
    }
  }

  renderGroups($storage.get('groups') || []);
  populateUsers($storage.get('users') || [], '#addgroup-user-list', 'addGroupUserNames[]');
  populateUsers($storage.get('users') || [], '#viewgroup-user-list', 'viewGroupUserNames[]');
  _window.initModals();

})(window, document, $, $U, Storage)
