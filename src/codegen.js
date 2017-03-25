const child_process = require('child_process');

function codegen(src, options, outCb, errCb) {

    let optLevel = parseInt(options.optimization);
    if (options.masm) {
        if (options.masm != "intel" && options.masm != "att") {
            errCb("masm option is wrong.");
            return;
        }
    }
    let gcc = child_process.spawn('gcc', [
        '-O'+optLevel, '-S', '-masm=' + options.masm, '-x' , 'c', '-' , '-o-'
    ]);

    let errorBuffer = [];
    let outBuffer = [];
    let sent = false;

    gcc.on('uncaughtException', function (evt) {
        console.error(evt);
    });

    gcc.stdout.on('data', (data) => {
        outBuffer.push(data.toString());
    });

    gcc.stdout.on('end', (data) => {
        if (sent) return;
        sent = true;
        outCb(outBuffer.join());
    })

    gcc.stderr.on('data', (data) => {
        errorBuffer.push(data.toString());
    })

    gcc.stderr.on('end', () => {
        if (sent) return;
        let result = errorBuffer.join();
        if (result.length === 0) return;
        sent = true;
        errCb(result);
    })

    gcc.stdin.write(src);
    gcc.stdin.end();
}

module.exports = {
    codegen: codegen
};
