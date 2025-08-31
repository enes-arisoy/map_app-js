import { personIcon } from "./constants.js";
import getStatusIcon from "./helper.js";
import elements from "./ui.js";

// global scopelar
let onMapCoords;
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let layer;
let map;

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Current Location");
  },
  (e) => {
    loadMap([37.13877, 27.56525], "Default Location");
  }
);

function loadMap(currentPosition, message) {
  map = L.map("map", { zoomControl: false }).setView(currentPosition, 6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // haritanın zoom kontrol alanının konumunu belirle

  L.control.zoom({ position: "bottomright" }).addTo(map);

  let marker = L.marker(currentPosition, { icon: personIcon })
    .addTo(map)
    .bindPopup(message);

  // harita üzerine layer ekle
  layer = L.layerGroup().addTo(map);

  map.on("click", onMapClick);

  // notlardan gelen markerları render et
  renderMarker();
}

function onMapClick(e) {
  onMapCoords = [e.latlng.lat, e.latlng.lng];

  // aside kısmını ekleme moduna geçir
  elements.aside.classList.add("add");
}

// cancel btn tıklayınca aside kısmını eski haline getir
elements.cancelBtn.addEventListener("click", () => {
  elements.aside.classList.remove("add");
});

// form gönderildiğinde çalışacak fonksiyon

elements.form.addEventListener("submit", (e) => {
  e.preventDefault();
  // form içerisindeki değerlere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // bir note objesi oluştur

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: onMapCoords,
  };

  // note objesini notes dizisine ekle
  notes.push(newNote);

  //
  localStorage.setItem("notes", JSON.stringify(notes));
  // formu resetle
  e.target.reset();
  elements.aside.classList.remove("add");

  // notları ve markerları güncelle
  renderNotes();
  renderMarker();
});

// local storagedaki notları aside kısmındaki liste içerisinde render et

function renderNotes() {
  const noteCard = notes
    .map((note) => {
      // tarih formatla
      const date = new Date(note.date).toLocaleDateString("en", {
        weekday: undefined,
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return `<li>
          <div>
            <p>${note.title}</p>
            <p>${date}</p>
            <p>${note.status}</p>
          </div>
          <div class="icons">
            <i data-id=${note.id} class="bi bi-airplane-fill fly-btn"></i>
            <i data-id=${note.id} class="bi bi-trash delete-btn"></i>
          </div>
        </li>`;
    })
    .join(" ");
  // html yi aside kısmındaki listeye aktar
  elements.noteList.innerHTML = noteCard;
}

// delete Iconlara eriş
elements.noteList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    deleteNote(id);
  }
});

// fly-to ıconlarına eriş

elements.noteList.addEventListener("click", (e) => {
  if (e.target.classList.contains("fly-btn")) {
    const id = +e.target.dataset.id;
    flyToNote(id);
  }
});

// silme işlemi yapan fonksiyon
function deleteNote(id) {
  const res = confirm("Are you sure to delete note?");
  if (res) {
    notes = notes.filter((note) => note.id !== Number(id));

    localStorage.setItem("notes", JSON.stringify(notes));

    renderNotes();
    renderMarker();
  }
}

// nota zoomlama fonksiyonu
function flyToNote(id) {
  // id si bilinen elemanı note dizisi içinden bul;

  const foundedNote = notes.find((note) => note.id == id);
  console.log(foundedNote.coords);

  map.flyTo(foundedNote.coords, 8);
}

// mevcut notlar için birer marker render eden fonksiyon
function renderMarker() {
  if (!layer) return; // layer hazır değilse çalışmasın

  // ✅ önce layer’ı temizle
  layer.clearLayers();

  // ✅ noteları dön ve marker ekle
  notes.forEach((note) => {
    if (note.coords) {
      L.marker(note.coords, { icon: getStatusIcon(note.status) })
        .addTo(layer)
        .bindPopup(`${note.title} <br> ${note.date}`);
    }
  });
}

// aside kısmına hide classı ekle
elements.arrowIcon.addEventListener("click", () => {
  elements.aside.classList.toggle("hide");
});

document.addEventListener("DOMContentLoaded", () => {
  renderNotes();
});
