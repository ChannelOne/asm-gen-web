const child_process = require('child_process');

function codegen(src, outCb, errCb) {
    let gcc = child_process.spawn('gcc', [
        '-O0', '-S', '-masm=intel', '-x' , 'c', '-' , '-o-'
    ]);

    let errorBuffer = [];
    let outBuffer = [];

    gcc.on('uncaughtException', function (evt) {
        console.error(evt);
    });

    gcc.stdout.on('data', (data) => {
        outBuffer.push(data.toString());
    });

    gcc.stdout.on('end', (data) => {
        outCb(outBuffer.join());
    })

    gcc.stderr.on('data', (data) => {
        errorBuffer.push(data.toString());
    })

    gcc.stderr.on('end', () => {
        errCb(errorBuffer.join());
    })

    gcc.stdin.write(src);
    gcc.stdin.end();
}

module.exports = {
    codegen: codegen
};
