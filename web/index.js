function request(route) {
  return fetch(route)
    .then(res => res.json())
    .then(x => {
      console.log(x);
      return x;
    })
}

const getCoverUrl = (image = {}) => {
  const { imageBuffer } = image;
  if (!imageBuffer) return 'https://t3.ftcdn.net/jpg/01/09/40/34/240_F_109403479_3BJH2QY7zrMV5OUGPePPmxPYZf0zY4lR.jpg';
  const { imageBuffer: { data: uintarr } = {} } = image;
  const blob = new Blob([new Uint8Array(uintarr)]);
  const urlCreator = window.URL || window.webkitURL;

  return urlCreator.createObjectURL(blob);
}

function info() {
  request('/playing')
    .then(cur => {
      document.getElementById('artist').innerHTML = `Artist: ${cur.artist}`;
      document.getElementById('title').innerHTML = `Title: ${cur.title}`;
      document.getElementById('cover').src = getCoverUrl(cur.image)
    })
}

function controlsGetPlaylist() {
  document.getElementById('getPlaylist').innerHTML = ''
  request('/controls/getPlaylist')
    .then((plist) => {
      const parent = document.getElementById('getPlaylist');
      parent.innerHTML = '';
      plist.forEach((el, i) => {
        const ch = document.createElement('li')
        if (el.isPlaying) {
          ch.style.background = 'lightgreen';
          ch.className = 'list-group-item';
        }
        ch.innerHTML = `${i}: ${el.fsStats.stringified}`;
        parent.appendChild(ch);
      })
    })
}

function controlsShufflePlaylist() {
  request('/controls/shufflePlaylist').then(controlsGetPlaylist)
}

function controlsNext() {
  request('/controls/next').then(controlsGetPlaylist).then(info)
}

function controlsRearrange({ oldIndex, newIndex }) {
  request(`/controls/rearrangePlaylist?oldIndex=${oldIndex}&newIndex=${newIndex}`).then(controlsGetPlaylist)
}

Sortable.create(document.getElementById('getPlaylist'), { onEnd: controlsRearrange });
