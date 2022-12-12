/**
 * script for neos fomat to html fomat
 * @file neos_common.js
 * @author Sinduy <sjsanjsrh@naver.com>
 * @version 1.0.0
 */

/**
 * convert neos text to html text
 * @param {string} text neos text
 * @returns {string} html text
 */
function neos_text_to_html(text) {
    let res = new String(text)
    // change color tag
    res = res.replace(/<color=(.*?)>/g, '<span style="color:$1">');
    res = res.replace(/<\/color>/g, '</span>');
    return res;
}