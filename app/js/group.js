/**
 * Handles CRUD operation on Group Entity
 */
(function (_window, _document, $, $U, $storage) {
  'use strict';

  // Called when a group is added
  $U('#add-group-btn').addEventListener('click', function () {
      var _groupName = $U('#group-name').value;
      // Get all the selected users for the group
      // We will associate that Group with all these users
      var _users = (function() {
        var _userCheckboxes = _document.getElementsByName("addGroupUserNames[]") || [];
        var _arr = [];
        for(var i = 0, iL = _userCheckboxes.length; i < iL; i++) {
          if(_userCheckboxes[i].checked)
            _arr.push(_userCheckboxes[i].value);
        }
        return _arr;
      })();

      // Sanitation Check
      if(!_groupName) {
        _window.toast("Enter a valid user name");
        return;
      }

      // Get the entities and Maps
      var _groups = $storage.get('groups') || [];
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      // Check for duplicate group names
      for(var i = 0, iL = _groups.length; i < iL; i++) {
        var _group = _groups[i];
        if(_group.name === _groupName) {
          _window.toast('Group already exists');
          return;
        }
      }

      // After all checks, add the group
      _groups.push({
        name: _groupName,
      })

      // Make necessary maps to link users and groups
      _groupsUsers[_groupName] = _users;

      _users.forEach(function (_user) {
        _usersGroups[_user] = _usersGroups[_user] || [];
        _usersGroups[_user].push(_groupName);
      })


      // Update localStorage
      $storage.set('groups', _groups);
      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      // Close the modal
      $U('#add-new-group').classList.remove('open');

      // Render the User List
      renderGroups(_groups);
  });

  // Called when a group is updated
  $U('#save-group-btn').addEventListener('click', function () {
      var _groupName = $U('#save-group-name').value;
      // Get all the selected users for the group
      // We will associate that Group with all these users
      var _selectedUsers = (function() {
        var _userCheckboxes = _document.getElementsByName("viewGroupUserNames[]") || [];
        var _arr = [];
        for(var i = 0, iL = _userCheckboxes.length; i < iL; i++) {
          if(_userCheckboxes[i].checked)
            _arr.push(_userCheckboxes[i].value);
        }
        return _arr;
      })()

      // Sanitation check
      if(!_groupName) {
        _window.toast("Enter a valid group name");
        return;
      }

      // Get the entities and Maps
      var users = $storage.get('users') || [];
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      // Update maps
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

      // Update localStorage
      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      // Close the modal
      $U('#view-group').classList.remove('open');
  });

  // Renders the list of Groups and attaches event listeners
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

  // Called when delete action is performed on Group
  function deleteGroup (groupName) {
    var _groups = $storage.get('groups');

    // First, remove the user from users array
    for(var i = 0, iL = _groups.length; i < iL; i++) {
      var _group = _groups[i];
      if(_group.name === groupName) {
        _groups.splice(i, 1);
        $storage.set('groups', _groups);
        renderGroups(_groups);
        break;
      }
    }

    // Next, update the maps
    var _usersGroups = $storage.get('usersGroups') || {};
    var _groupsUsers = $storage.get('groupsUsers') || {};

    var usersAssociated = _groupsUsers[groupName];
    delete _groupsUsers[groupName];

    usersAssociated.forEach(function (_user) {
      _usersGroups[_user].splice(_usersGroups[_user].indexOf(groupName), 1);
    })

    $storage.set('usersGroups', _usersGroups);
    $storage.set('groupsUsers', _groupsUsers);

    // Then re render the updated users
    renderUsers($storage.get('groups') || []);
  }

  // Used to populate users in add and view group forms
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

  // Called when someone clicks on a Group
  // Sets the name of the Group and updates the users that are in that group
  function showGroup (groupName) {
    $U('#save-group-name').value = groupName;
    var _userCheckboxes = _document.getElementsByName("viewGroupUserNames[]") || [];

    var _groupsUsers = $storage.get('groupsUsers');
    var _associatedUsers = _groupsUsers[groupName];

    for(var i = 0, iL = _userCheckboxes.length; i < iL; i++) {
      _userCheckboxes[i].checked = _associatedUsers.indexOf(_userCheckboxes[i].value) > -1;
    }
  }

  // Initialise the page
  renderGroups($storage.get('groups') || []);
  populateUsers($storage.get('users') || [], '#addgroup-user-list', 'addGroupUserNames[]');
  populateUsers($storage.get('users') || [], '#viewgroup-user-list', 'viewGroupUserNames[]');
  _window.initModals();

})(window, document, $, $U, Storage)
