/**
 * script for neos fomat to html fomat
 * @file neos_common.js
 * @author Sinduy <sjsanjsrh@naver.com>
 * @version 1.0.1
 */

/**
 * convert neos text to html text
 * @param {string} text neos text
 * @param {string} tag (optional) parent tag name
 * @returns {string} html text
 */
function neos_text_to_html(text, tag) {
    let res = new String(text)
    // change color tag
    res = res.replace(/<color=(.*?)>/g, '<span style="color:$1">');
    res = res.replace(/<\/color>/g, '</span>');
    if(tag) return "<"+tag+">"+res+"</"+tag+">";
    else return res;
}