module.exports = {
    input: './src/index.js',
    output: {
        file: './dist/js/bundle.js',
        format: 'iife',
        name: 'desk',
        globals: ['io', 'nunjucks'] // for socketio client, which is imported directly
    },
    plugins: [
        require('rollup-plugin-commonjs')(),
        require('rollup-plugin-json')(),
        require('rollup-plugin-node-resolve')({
            preferBuiltins: true
        }),
    ],
}