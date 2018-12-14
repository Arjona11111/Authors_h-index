var apiKey = '';
var date = new Date();
var fullYear = date.getFullYear();

chrome.runtime.onMessage.addListener(
  function(request, sender) {
    console.log(request);
    displayTable(request);
    let tr = document.getElementById('body');
    let row = body.rows.length;
    console.log(body);
    for (let i = row - 1; i > 10; i--) {
      body.deleteRow(i);
    }
  }
);

chrome.storage.sync.get(['myApi', 'mySrch', 'top10'], function(localdata) {
  apiKey = localdata.myApi || '';
  mySrch = localdata.mySrch || '';
  top10 = localdata.top10 || '';
  console.log(top10);

  $('#inputField').val(mySrch);
  $('#copyrightYear').text(fullYear);

  displayTable(top10);
});

function displayTable(results) {
  let top10 = results.slice(0, 10);
  document.getElementById('ring').style.display = "none";
  document.getElementById("resultsTable").style.display = "block";

  for (let i = 0; i < 10; i++) {

    let myTable = document.getElementsByTagName("tbody")[0];
    let row = myTable.insertRow(i + 1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);

    cell0.innerHTML = top10[i].Name;
    cell1.innerHTML = top10[i].Surname;
    cell2.innerHTML = top10[i].index;

    cell3.innerHTML = (
      '<a href="https://www.scopus.com/authid/detail.uri?authorId=' +
      top10[i].id +
      '"target="_blank">Scopus</a>'
    )
  }
}

function searchOnClick() {
  let topic = document.getElementById('inputField').value;
  setTopic(topic);
  document.getElementById('resultsTable').style.display = "none";
  document.getElementById('ring').style.display = "block";
  chrome.runtime.sendMessage(topic);
  chrome.storage.sync.remove("top10");
}

function setTopic(value) {
  let mySrch = document.getElementById('inputField').value;
  chrome.storage.sync.set({
    mySrch: value
  });
}

function settingTopic() {
  let myImg = chrome.i18n.getMessage('wosALLDB');
  let optionMSG = chrome.i18n.getMessage('optionMSG');
  let placeHolder = chrome.i18n.getMessage('placeHolder');
  let fullYear = new Date().getFullYear();

  $('#inputField').attr("placeholder", placeHolder);
  $('#copyrightYear').text(fullYear);
}

$(document).ready(function() {
  $('#search1').click(searchOnClick);
  $('#inputField').focus();

  $('#resetButton').click(function() {
    $('#inputField').val('');
    $('#inputField').focus();
  });
  settingTopic();
});
