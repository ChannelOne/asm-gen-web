document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    }

    function b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    var src = [
        "#include <stdio.h>",
        "#include <stdint.h>",
        "",
        "uint16_t add(uint16_t a, uint16_t b) {",
        "   return a + b;",
        "}",
        "",
    ];
    
    var textareaInput = document.getElementById('code-input');
    textareaInput.value = src.join('\n');

    var outputArea = document.getElementById('output-area');
    var errorPad = document.getElementById('error-pad');

    var optSelect = document.getElementById('optimization-select');
    var masmSelect = document.getElementById('masm-select');

    var inputEditor = CodeMirror.fromTextArea(textareaInput, {
        lineNumbers: true,
        matchBrackets: true,
        mode: "text/x-csrc"
    });

    var outputEditor = CodeMirror.fromTextArea(outputArea, {
        lineNumbers: true,
    })

    var convertBtn = document.getElementById('convert-button');
    convertBtn.addEventListener('click', function (event) {
        event.preventDefault();

        var uploadData = {
            data: b64EncodeUnicode(inputEditor.getDoc().getValue()),
            optimization: parseInt(optSelect.value),
            masm: masmSelect.value,
        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', '/data')
        xmlhttp.setRequestHeader('Content-Type', 'application/json')
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    var _data = JSON.parse(xmlhttp.responseText);
                    if (_data.status == "success") {
                        outputEditor.getDoc().setValue(b64DecodeUnicode(_data.data)); 
                        errorPad.innerText = "";
                    } else {
                        errorPad.innerText = b64DecodeUnicode(_data.data);
                    }
                } else {
                    console.error(xmlhttp.status.toString() + ":" + xmlhttp.responseText);
                }
            }
        }
        xmlhttp.send(JSON.stringify(uploadData));
    })
});
