export default (typeof Promise !== "undefined") ?
    Promise :
    require("es6-promise").Promise;
