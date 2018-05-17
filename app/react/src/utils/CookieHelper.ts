/* https://www.w3schools.com/js/js_cookies.asp */
export function getCookie(cname: string) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let item of ca) {
        while (item.charAt(0) === ' ') {
            item = item.substring(1);
        }
        if (item.indexOf(name) === 0) {
            return item.substring(name.length, item.length);
        }
    }
    return "";
}