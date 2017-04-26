(function(ext) {

  var id = 1;

  ext._shutdown = function() {
    requestMaBeeeAction('devices/' + id + '/disconnect');
    requestMaBeeeAction('scan/stop');
  };

  ext._getStatus = function() {
    return {status: 2, msg: 'Ready'};
  };

  ext.setMaBeeeOn = function() {
    requestMaBeeeAction('devices/' + id + '/set?pwm_duty=100');
  };

  ext.setMaBeeeOff = function() {
    requestMaBeeeAction('devices/' + id + '/set?pwm_duty=0');
  };

  ext.setMaBeeePower = function(power) {
    requestMaBeeeAction('devices/' + id + '/set?pwm_duty=' + power);
  };

  ext.setMaBeeeOnAfterWaiting = function(wait, callback) {
    setTimeout(function() {
      requestMaBeeeAction('devices/' + id + '/set?pwm_duty=100');
      callback();
    }, wait * 1000);
  };

  ext.setMaBeeeOffAfterWaiting = function(wait, callback) {
    setTimeout(function() {
      requestMaBeeeAction('devices/' + id + '/set?pwm_duty=0');
      callback();
    }, wait * 1000);
  };

  ext.getRssi = function(callback) {
    requestMaBeeeAction('devices/' + id + '/update?p=rssi');
    getRssiById(id, function(rssi) {
      callback(parseInt(rssi, 10) * (-1));
    });       
  };
  
  ext.connectMaBeee = function() {
    requestMaBeeeAction('scan/start');
    name = prompt("接続したいMaBeeeの名前を入力してください。");
    getIdByName(name, function(id) {
      this.id = id;
    });
    setTimeout(function() {
      requestMaBeeeAction('devices/' + id + '/connect');
      setTimeout(function(){
        requestMaBeeeAction('scan/stop');
        showMaBeeeStateInAlert(id);
      }, 2000);
    }, 10000);
  };

  ext.disconnectMaBeee = function(){
    requestMaBeeeAction('devices/' + id + '/disconnect');
  };

  var descriptor = {
    blocks: [
      [' ', 'MaBeeeをオンにする', 'setMaBeeeOn'],
      [' ', 'MaBeeeをオフにする', 'setMaBeeeOff'],
      [' ', 'MaBeeeの出力を %s にする', 'setMaBeeePower', 50],
      ['w', '%s 後にMaBeeeをオンにする', 'setMaBeeeOnAfterWaiting', 3],
      ['w', '%s 後にMaBeeeをオフにする', 'setMaBeeeOffAfterWaiting', 3],
      ['R', 'でんぱのつよさ', 'getRssi'],
      [' ', 'MaBeeeとせつぞくする', 'connectMaBeee'],
      [' ', 'MaBeeeのせつぞくをやめる', 'disconnectMaBeee'],
    ]
  };

  ScratchExtensions.register('MaBeee Extension', descriptor, ext);
})({});


function getXHR() {
  var request;
  try {
    request = new XMLHttpRequest();
  } catch(e) {
    try {
      request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch(e) {
      request = new ActiveXObject('Microsoft.XMLHTTP');
    }
  }
  return request;
}

//pathを渡してMaBeeeにHTTP GETするメソッドです。
function requestMaBeeeAction(path) {
  var request = getXHR();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {

      } else {
        alert(request.responseText);
      }
    } else {

    }
  };
  request.open('GET', 'http://localhost:11111/' + path, true);
  request.send(null);
  setTimeout(function(){}, 100);
}

function showMaBeeeStateInAlert(id) {
  var request = getXHR();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {
        var json = eval('(' + request.responseText + ')');
        if (json.name == null) {
          alert(request.responseText);
        } else {
          alert(json.name + 'に接続しました。');
        }
      } else {
        alert("MaBeeeとの接続中にエラーが発生しました");
      }
    } else {

    }
  };
  request.open('GET', 'http://localhost:11111/devices/' + id, true);
  request.send(null);
  setTimeout(function(){}, 100);
};


//Idから電波強度を取得します。数値はマイナス値で返されます。
function getRssiById(id, callback) {
  var request = getXHR();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {
        var json = eval('(' + request.responseText + ')');
        callback(json.rssi);
      } else {
        alert("電波強度の取得中にエラーが発生しました。");
      }
    } else {

    }
  };
  request.open('GET', 'http://localhost:11111/devices/' + id, true);
  request.send(null);
  setTimeout(function(){}, 100);
}

function getIdByName(name, callback) {
  var request = getXHR();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {
        var json = eval('(' + request.responseText + ')');
        for (var i = 0; i < json.length; i++) {
          if (json.devices[i].name === name) {
            callback(json.devices[i].id);
          }
        }
      } else {
        alert(request.responseText);
      }
    } else {

    }
  };
  request.open('GET', 'http://localhost:11111/devices/', true);
  request.send(null);
  setTimeout(function(){}, 100);
}
