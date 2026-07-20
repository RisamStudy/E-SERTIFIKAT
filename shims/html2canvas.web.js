/**
 * Shim kosong untuk html2canvas di platform web.
 * react-native-view-shot mengimport html2canvas hanya untuk web,
 * tapi kita tidak menggunakan ViewShot di web — hanya di native build.
 */
module.exports = function html2canvas() {
  return Promise.reject(new Error('ViewShot tidak didukung di web.'));
};
