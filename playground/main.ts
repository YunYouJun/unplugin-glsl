import rawShader from './glsl/main.frag?raw'
import shader from './glsl/main.frag'

import chunk0 from './glsl/chunk0.frag?raw'
import chunk1 from './glsl/utils/chunk1.glsl?raw'
import chunk2 from './glsl/utils/chunk2.frag?raw'
import chunk3 from './glsl/chunk3.frag?raw'

import importedGlsl from './glsl/import/imported.glsl?raw'

import './index.css'

// eslint-disable-next-line no-console
console.info(`Shader Length: ${shader.length} characters.`)
const app = document.getElementById('app')
if (!app)
  throw new Error('No #app element found.')

createRawChunkTags()

const resultTag = document.createElement('pre')
resultTag.innerHTML = `<code class="language-glsl">${shader}</code>`
app.appendChild(resultTag)
// app.innerHTML = '__UNPLUGIN__'

function createRawChunkTags() {
  const rawChunks: {
    title: string
    content: string
  }[] = [
    {
      title: 'glsl/main.frag',
      content: rawShader,
    },

    {
      title: 'glsl/chunk0.frag',
      content: chunk0,
    },
    {
      title: 'glsl/utils/chunk1.glsl',
      content: chunk1,
    },
    {
      title: 'glsl/utils/chunk2.frag',
      content: chunk2,
    },
    {
      title: 'glsl/chunk3.frag',
      content: chunk3,
    },
    {
      title: 'glsl/import/imported.glsl',
      content: importedGlsl,
    },
  ]

  const rawCodeContainer = document.querySelector('#raw-code')
  if (!rawCodeContainer)
    return

  rawChunks.forEach((chunk) => {
    const headerTag = document.createElement('h5')
    headerTag.style.marginBottom = '0.5rem'
    headerTag.style.opacity = '0.5'
    headerTag.innerHTML = chunk.title
    rawCodeContainer.appendChild(headerTag)

    const rawChunkTag = document.createElement('pre')
    rawChunkTag.innerHTML = `<code class="language-glsl">${chunk.content}</code>`
    rawCodeContainer.appendChild(rawChunkTag)
  })
}
