let apiKey = '';

chrome.storage.sync.get(['myApi'], function(localdata) {
  apiKey = localdata.myApi || '';
})

chrome.runtime.onMessage.addListener(
  function(request, sender) {
    fetchThings(request);
  }
);

function fetchThings(topic) {
  fetchAuthorsFromTopic(topic).then((authors) => {
    console.log(authors);
    const uniqueAuthors = removeDuplicatedObjects(authors, "authid");

    const authorIds = uniqueAuthors.map(x => x.authid);

    let limitedAuthId = [];
    let limit = 20;
    authorIds.forEach((item) => {
      if (!limitedAuthId.length || limitedAuthId[limitedAuthId.length - 1].length == limit)
        limitedAuthId.push([]);
      limitedAuthId[limitedAuthId.length - 1].push(item);
    });
    fetchAuthorsFromId(limitedAuthId);
  });
}

function fetchAuthorsFromTopic(topic) {
  let apiUrl = "https://api.elsevier.com/content/search/scopus";
  let params = "count=100&field=authname,authid&sort=citedby-count";

  let query = `${apiUrl}?query=all(${topic})&${params}&apiKey=${apiKey}`;
  return fetchAuthorsId(query);
}

function fetchAuthorsId(query) {
  return fetch(query).then(response => response.json())
    .then(res => res["search-results"].entry.map(x => x.author).flat());
}


function fetchAuthorsFromId(limitedAuthId) {
  let indxUrl = "https://api.elsevier.com/content/author";
  let params1 = "field=h-index,identifier,given-name,surname";
  let json = "httpAccept=application/json";

  let arrayOfPromises = [];
  let i = 0;
  while (i < limitedAuthId.length) {
    var url = indxUrl + "?author_id=" + limitedAuthId[i] + "&" + params1 +
      "&" + "apiKey=" + apiKey + "&" + json;

    let checkReturn = fetchLimitedAuthIds(url);

    arrayOfPromises.push(checkReturn);
    i++;
  }

  let finalArray = [];
  Promise.all(arrayOfPromises).then(function(values) {
    let flatValues = values.concat.apply([], values);
    let results = flatValues.map(x => ({
      "index": x["h-index"],
      "id": x.coredata["dc:identifier"].replace("AUTHOR_ID:", ""),
      "Name": x["preferred-name"]["given-name"],
      "Surname": x["preferred-name"]["surname"]
    })).sort((a, b) => b.index - a.index);

    let top10 = results.slice(0, 10);
    console.log(top10);
    chrome.runtime.sendMessage(top10);
    chrome.storage.sync.set({ top10 });
  });
}

function fetchLimitedAuthIds(values) {
  return fetch(values).then(response => response.json())
    .then(res => (
      res["author-retrieval-response-list"]["author-retrieval-response"]
    ));
}

function removeDuplicatedObjects(result, key) {
  const newArray = [];
  for (let i = 0; i < result.length; i++) {
    const element = result[i];
    const value = element[key];

    if (findIndexOfObject(newArray, key, value) === -1) {
      newArray.push(element);
    }
  }
  return newArray;
}

function findIndexOfObject(result, key, value) {
  return result.findIndex(element => element[key] === value);
}
