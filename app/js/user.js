/**
 * Handles CRUD operation on User Entity
 */
(function (_window, _document, $, $U, $storage) {
  'use strict';

  // Called when a user is added
  $U('#add-user-btn').addEventListener('click', function () {
      var _userName = $U('#user-name').value;
      // Get all the selected groups for the user
      // We will associate that User with all these groups
      var _groups = (function() {
        var _groupCheckboxes = _document.getElementsByName("addUserGroupNames[]") || [];
        var _arr = [];
        for(var i = 0, iL = _groupCheckboxes.length; i < iL; i++) {
          if(_groupCheckboxes[i].checked)
            _arr.push(_groupCheckboxes[i].value);
        }
        return _arr;
      })()

      // Sanitation Check
      if(!_userName) {
        _window.toast("Enter a valid user name");
        return;
      }

      // Sanitation Check
      if(_groups.length === 0) {
        _window.toast("A user must be associated with atleast 1 group");
        return;
      }

      // Get the entities and Maps
      var _users = $storage.get('users') || [];
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      // Check for duplicate user names
      for(var i = 0, iL = _users.length; i < iL; i++) {
        var _user = _users[i];
        if(_user.name === _userName) {
          _window.toast('User already exists');
          return;
        }
      }

      // After all checks, add the user
      _users.push({
        name: _userName,
      })

      // Make necessary maps to link users and groups
      _usersGroups[_userName] = _groups;

      _groups.forEach(function (_group) {
        _groupsUsers[_group] = _groupsUsers[_group] || [];
        _groupsUsers[_group].push(_userName);
      })


      // Update localStorage
      $storage.set('users', _users);
      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      // Close the modal
      $U('#add-new-user').classList.remove('open');

      // Render the User List
      renderUsers(_users);
  });

  // Called when a user is updated
  $U('#save-user-btn').addEventListener('click', function () {
      var _userName = $U('#save-user-name').value;
      // Get all the selected groups for the user
      // We will associate that User with all these groups
      var _selectedGroups = (function() {
        var _groupCheckboxes = _document.getElementsByName("viewUserGroupNames[]") || [];
        var _arr = [];
        for(var i = 0, iL = _groupCheckboxes.length; i < iL; i++) {
          if(_groupCheckboxes[i].checked)
            _arr.push(_groupCheckboxes[i].value);
        }
        return _arr;
      })()

      // Sanitation check
      if(!_userName) {
        _window.toast("Enter a valid user name");
        return;
      }

      // Sanitation check
      if(_selectedGroups.length === 0) {
        _window.toast("A user must be associated with atleast 1 group");
        return;
      }

      // Get the entities and Maps
      var groups = $storage.get('groups') || [];
      var _usersGroups = $storage.get('usersGroups') || {};
      var _groupsUsers = $storage.get('groupsUsers') || {};

      // Update maps
      _usersGroups[_userName] = _selectedGroups;

      groups.forEach(function (_group) {
        if(_selectedGroups.indexOf(_group.name) > -1) {
            if(_groupsUsers[_group.name].indexOf(_userName) === -1) {
              _groupsUsers[_group.name].push(_userName);
            }
        }
        else {
          _groupsUsers[_group.name].splice(_groupsUsers[_group.name].indexOf(_userName));
        }
      })

      // Update localStorage
      $storage.set('usersGroups', _usersGroups);
      $storage.set('groupsUsers', _groupsUsers);

      // Close the modal
      $U('#view-user').classList.remove('open');
  });

  $U('#user-filter').addEventListener('keyup', function (event) {
    var filterText = this.value;

    var _users = $U('#user-container').children;
    for(var i = 0, iL = _users.length; i < iL; i++) {
      var userName = _users[i].getAttribute('data-view-user');
      if(userName.toLowerCase().indexOf(filterText.toLowerCase()) > -1) {
        if(filterText.length > 0) {
          if(!_users[i].classList.contains('highlight')) {
            _users[i].classList.add('highlight');
          }
        }
        else {
          _users[i].classList.remove('highlight');
        }
      }
      else {
        _users[i].classList.remove('highlight');
      }
    }
  });


  // Renders the list of Users and attaches event listeners
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

  // Called when delete action is performed on User
  function deleteUser (userName) {
    var _users = $storage.get('users');

    // First, remove the user from users array
    for(var i = 0, iL = _users.length; i < iL; i++) {
      var _user = _users[i];
      if(_user.name === userName) {
        _users.splice(i, 1);
        $storage.set('users', _users);
        renderUsers(_users);
        break;
      }
    }

    // Next, update the maps
    var _usersGroups = $storage.get('usersGroups') || {};
    var _groupsUsers = $storage.get('groupsUsers') || {};

    var groupsAssociated = _usersGroups[userName];
    delete _usersGroups[userName];

    groupsAssociated.forEach(function (_group) {
      _groupsUsers[_group].splice(_groupsUsers[_group].indexOf(userName), 1);
    })

    $storage.set('usersGroups', _usersGroups);
    $storage.set('groupsUsers', _groupsUsers);

    // Then re render the updated users
    renderUsers($storage.get('users') || []);
  }

  // Used to populate groups in add and view user forms
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

  // Called when someone clicks on a User
  // Sets the name of the User and updates the group they are in
  function showUser (userName) {
    $U('#save-user-name').value = userName;
    var _groupCheckboxes = _document.getElementsByName("viewUserGroupNames[]") || [];

    var _usersGroups = $storage.get('usersGroups');
    var _associatedGroups = _usersGroups[userName];

    for(var i = 0, iL = _groupCheckboxes.length; i < iL; i++) {
      _groupCheckboxes[i].checked = _associatedGroups.indexOf(_groupCheckboxes[i].value) > -1;
    }
  }

  // Initialise the page
  renderUsers($storage.get('users') || []);
  populateGroups($storage.get('groups') || [], '#adduser-group-list', 'addUserGroupNames[]');
  populateGroups($storage.get('groups') || [], '#viewuser-group-list', 'viewUserGroupNames[]');
  _window.initModals();

})(window, document, $, $U, Storage)
