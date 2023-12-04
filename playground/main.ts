import shader from './glsl/main.frag'

// eslint-disable-next-line no-console
console.info(`Shader Length: ${shader.length} characters.`)
const app = document.getElementById('app')
if (!app)
  throw new Error('No #app element found.')

app.innerHTML = `<pre><code class="language-glsl">${shader}</code></pre>`
// app.innerHTML = '__UNPLUGIN__'
