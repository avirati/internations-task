(function (_window, _document, $, $U, $storage) {
  'use strict';

  $U('#add-group-btn').addEventListener('click', function () {
      var _groupName = $U('#group-name').value;

      if(_groupName) {
        var _groups = $storage.get('groups') || [];

        for(var i = 0, iL = _groups.length, group = _groups[i]; i < iL; i++) {
          if(group.name === _groupName) {
            _window.toast('Group already exists');
            return;
          }
        }

        _groups.push({
          name: _groupName,
          users: []
        })

        $storage.set('groups', _groups);

        $U('#add-new-group').classList.remove('open');

        renderGroups(_groups);
      }
  });

  function renderGroups (groups) {
    var _groupsUl = $U('#group-container');
    _groupsUl.innerHTML = '';

    groups.forEach(function (group) {
      var _li = _document.createElement('li');
      _li.innerHTML = group.name;
      _groupsUl.appendChild(_li);

      var _deleteButton = _document.createElement('button');
      _deleteButton.className = "btn btn-circle delete-group right";
      if(group.users.length !== 0) {
        _deleteButton.classList.add('disabled');
      }
      _deleteButton.innerHTML = '-';
      _deleteButton.setAttribute('data-delete-group', group.name);
      _deleteButton.addEventListener('click', function (event) {
        var _groupName = event.target.getAttribute('data-delete-group');
        if(group.users.length === 0) {
          deleteGroup(_groupName);
        }
      })

      _li.appendChild(_deleteButton);
    })
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
  }

  renderGroups($storage.get('groups'))

})(window, document, $, $U, Storage)
