const child_process = require('child_process');

function codegen(src, outCb, errCb) {
    let gcc = child_process.spawn('gcc', [
        '-O0', '-S', '-masm=intel', '-x' , 'c', '-' , '-o-'
    ]);

    gcc.on('uncaughtException', function (evt) {
        console.error(evt);
    });

    gcc.stdout.on('data', outCb);
    gcc.stderr.on('data', errCb);

    gcc.stdin.write(src);
    gcc.stdin.end();
}

module.exports = {
    codegen: codegen
};
