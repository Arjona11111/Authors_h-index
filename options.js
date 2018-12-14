var date = new Date();
var fullYear = date.getFullYear();

chrome.storage.sync.get(['myApi'], function(localdata) {
  let myApi = localdata.myApi || '';
  let myImg = chrome.i18n.getMessage('wosALLDB');

  $('#inputText').val(myApi);
  $('#copyrightYear').text(fullYear);
});

function setApiKey() {
  var myApi = document.getElementById("inputText").value;
  chrome.storage.sync.set({ myApi });
}

function back() {
  window.history.back()
}

$(document).ready(function() {
  document.getElementById('myText').addEventListener('click', setApiKey);
});
